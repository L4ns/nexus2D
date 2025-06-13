import React from 'react';
import { Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';
import { PlatformInfo } from '../contexts/PlatformContext';

interface GameUIProps {
  score: number;
  lives: number;
  level: number;
  onPause: () => void;
  onMute: () => void;
  onSettings: () => void;
  isMuted: boolean;
  platform: PlatformInfo;
}

const GameUI: React.FC<GameUIProps> = ({
  score,
  lives,
  level,
  onPause,
  onMute,
  onSettings,
  isMuted,
  platform
}) => {
  const buttonSize = platform.isMobile ? 'p-3' : 'p-2';
  const textSize = platform.isMobile ? 'text-base' : 'text-sm';
  const spacing = platform.isMobile ? 'space-x-4' : 'space-x-6';

  return (
    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center z-10">
      {/* Game Stats */}
      <div className={`flex items-center ${spacing} bg-black/70 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2`}>
        <div className={`text-white font-bold ${textSize}`}>
          Score: <span className="text-yellow-400">{score.toLocaleString()}</span>
        </div>
        <div className={`text-white font-bold ${textSize}`}>
          Lives: <span className="text-red-400">{'❤️'.repeat(Math.max(0, lives))}</span>
        </div>
        <div className={`text-white font-bold ${textSize}`}>
          Level: <span className="text-green-400">{level}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onPause}
          className={`bg-blue-600 hover:bg-blue-700 text-white ${buttonSize} rounded-lg transition-colors touch-manipulation`}
          aria-label="Pause Game"
        >
          <Pause size={platform.isMobile ? 24 : 20} />
        </button>
        
        <button
          onClick={onMute}
          className={`bg-gray-600 hover:bg-gray-700 text-white ${buttonSize} rounded-lg transition-colors touch-manipulation`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={platform.isMobile ? 24 : 20} /> : <Volume2 size={platform.isMobile ? 24 : 20} />}
        </button>
        
        {platform.isMobile && (
          <button
            onClick={onSettings}
            className={`bg-gray-600 hover:bg-gray-700 text-white ${buttonSize} rounded-lg transition-colors touch-manipulation`}
            aria-label="Settings"
          >
            <Settings size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default GameUI;