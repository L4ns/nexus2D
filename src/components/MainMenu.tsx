import React from 'react';
import { Play, Trophy, Settings, Info, Star } from 'lucide-react';
import { SaveGameData } from '../contexts/SaveGameContext';
import { PlatformInfo } from '../contexts/PlatformContext';

interface MainMenuProps {
  onStartGame: () => void;
  onSettings: () => void;
  saveData: SaveGameData | null;
  platform: PlatformInfo;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onSettings, saveData, platform }) => {
  const buttonClass = platform.isMobile 
    ? "w-full bg-gradient-to-r text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-3 text-lg touch-manipulation"
    : "w-full bg-gradient-to-r text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2";

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-blue-800 to-purple-800 p-6 sm:p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
        {/* Game Title */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Nexus Platformer
          </h1>
          <p className="text-blue-200 text-sm sm:text-base">
            Cross-Platform Adventure
          </p>
          
          {/* Platform Indicator */}
          <div className="mt-2 text-xs text-gray-300">
            {platform.platform === 'ios' && '📱 iOS'}
            {platform.platform === 'android' && '🤖 Android'}
            {platform.platform === 'electron' && '💻 Desktop'}
            {platform.platform === 'web' && '🌐 Web'}
            {platform.isMobile && ' • Touch Controls'}
            {platform.supportsGamepad && ' • Gamepad Ready'}
          </div>
        </div>

        {/* Save Game Info */}
        {saveData && (
          <div className="mb-6 p-3 bg-black/30 rounded-lg">
            <div className="text-white text-sm">
              <div className="flex justify-between">
                <span>Level:</span>
                <span className="text-green-400">{saveData.currentLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>High Score:</span>
                <span className="text-yellow-400">{saveData.highScore.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Achievements:</span>
                <span className="text-purple-400">{saveData.achievements.length}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Menu Buttons */}
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={onStartGame}
            className={`${buttonClass} from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600`}
          >
            <Play size={platform.isMobile ? 24 : 20} />
            <span>{saveData ? 'Continue Adventure' : 'Start Adventure'}</span>
          </button>
          
          <button 
            className={`${buttonClass} from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600`}
            disabled
          >
            <Trophy size={platform.isMobile ? 24 : 20} />
            <span>Achievements</span>
          </button>
          
          <button 
            onClick={onSettings}
            className={`${buttonClass} from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700`}
          >
            <Settings size={platform.isMobile ? 24 : 20} />
            <span>Settings</span>
          </button>

          <button 
            className={`${buttonClass} from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600`}
            disabled
          >
            <Info size={platform.isMobile ? 24 : 20} />
            <span>How to Play</span>
          </button>
        </div>

        {/* Controls Info */}
        <div className="mt-6 text-sm text-gray-300">
          {platform.isMobile ? (
            <div>
              <p>🕹️ Virtual joystick to move</p>
              <p>↑ Jump button • ⚡ Run button</p>
            </div>
          ) : (
            <div>
              <p>🎮 WASD or Arrow Keys to move</p>
              <p>🚀 Space to jump • ⚡ Shift to run</p>
            </div>
          )}
        </div>

        {/* Version Info */}
        <div className="mt-4 text-xs text-gray-400">
          v1.0.0 • Built for {platform.platform}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;