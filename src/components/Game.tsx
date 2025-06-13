import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { usePlatform } from '../contexts/PlatformContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSaveGame } from '../contexts/SaveGameContext';
import GameUI from './GameUI';
import VirtualControls from './VirtualControls';
import MainMenu from './MainMenu';
import SettingsMenu from './SettingsMenu';
import { Play, Pause, Volume2, VolumeX, Settings, Home } from 'lucide-react';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { platform } = usePlatform();
  const { settings } = useSettings();
  const { saveData, saveGame } = useSaveGame();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'settings'>('menu');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  // Calculate responsive canvas size
  const getCanvasSize = () => {
    const maxWidth = platform.isMobile ? platform.screenWidth - 16 : 1024;
    const maxHeight = platform.isMobile ? platform.screenHeight - 200 : 576;
    const aspectRatio = 16 / 9;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width: Math.floor(width), height: Math.floor(height) };
  };

  const canvasSize = getCanvasSize();

  useEffect(() => {
    if (canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(canvasRef.current, {
        onScoreChange: (newScore) => {
          setScore(newScore);
          if (saveData) {
            saveGame({ score: newScore, highScore: Math.max(newScore, saveData.highScore) });
          }
        },
        onLivesChange: setLives,
        onLevelChange: (newLevel) => {
          setLevel(newLevel);
          if (saveData) {
            saveGame({ 
              currentLevel: newLevel,
              unlockedLevels: [...saveData.unlockedLevels, newLevel].filter((v, i, a) => a.indexOf(v) === i)
            });
          }
        },
        onGameOver: () => {
          setIsPlaying(false);
          setGameState('menu');
        }
      }, platform, settings);
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, [platform, settings, saveData]);

  // Handle platform-specific events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying && settings.gameplay.pauseOnFocusLoss) {
        pauseGame();
      }
    };

    const handleResize = () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.handleResize();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isPlaying, settings.gameplay.pauseOnFocusLoss]);

  const startGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
      setIsPlaying(true);
      setGameState('playing');
    }
  };

  const pauseGame = () => {
    if (gameEngineRef.current) {
      if (isPlaying) {
        gameEngineRef.current.pause();
        setIsPlaying(false);
        setGameState('paused');
      } else {
        gameEngineRef.current.resume();
        setIsPlaying(true);
        setGameState('playing');
      }
    }
  };

  const goToMenu = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pause();
    }
    setIsPlaying(false);
    setGameState('menu');
  };

  const toggleMute = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.setMuted(!settings.audio.muted);
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Game Canvas */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="block w-full h-auto"
          style={{ 
            imageRendering: 'pixelated',
            maxWidth: '100%',
            height: 'auto'
          }}
        />

        {/* Game UI Overlay */}
        {gameState === 'playing' && (
          <GameUI
            score={score}
            lives={lives}
            level={level}
            onPause={pauseGame}
            onMute={toggleMute}
            onSettings={() => setGameState('settings')}
            isMuted={settings.audio.muted}
            platform={platform}
          />
        )}

        {/* Virtual Controls for Mobile */}
        {(platform.isMobile || platform.hasTouch) && gameState === 'playing' && (
          <VirtualControls
            gameEngine={gameEngineRef.current}
            settings={settings}
            platform={platform}
          />
        )}

        {/* Main Menu */}
        {gameState === 'menu' && (
          <MainMenu
            onStartGame={startGame}
            onSettings={() => setGameState('settings')}
            saveData={saveData}
            platform={platform}
          />
        )}

        {/* Pause Menu */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gradient-to-br from-blue-800 to-purple-800 p-6 sm:p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Game Paused</h2>
              
              <div className="space-y-3">
                <button
                  onClick={pauseGame}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Play size={20} />
                  <span>Resume</span>
                </button>
                
                <button
                  onClick={() => setGameState('settings')}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={goToMenu}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Home size={20} />
                  <span>Main Menu</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Menu */}
        {gameState === 'settings' && (
          <SettingsMenu
            onBack={() => setGameState(isPlaying ? 'paused' : 'menu')}
            platform={platform}
          />
        )}
      </div>

      {/* Platform-specific status indicators */}
      {platform.isMobile && (
        <div className="mt-2 text-center text-xs text-gray-400">
          {platform.platform === 'ios' ? '📱 iOS' : platform.platform === 'android' ? '🤖 Android' : '📱 Mobile Web'}
        </div>
      )}
    </div>
  );
};

export default Game;