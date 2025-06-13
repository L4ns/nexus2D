import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameSettings } from '../contexts/SettingsContext';
import { PlatformInfo } from '../contexts/PlatformContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface VirtualControlsProps {
  gameEngine: GameEngine | null;
  settings: GameSettings;
  platform: PlatformInfo;
}

const VirtualControls: React.FC<VirtualControlsProps> = ({ gameEngine, settings, platform }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });

  const joystickSize = 80 * settings.controls.virtualJoystickSize;
  const buttonSize = 60 * settings.controls.buttonSize;

  const handleHapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (settings.controls.hapticFeedback && platform.supportsHaptics) {
      try {
        await Haptics.impact({ style });
      } catch (error) {
        console.warn('Haptic feedback not available');
      }
    }
  };

  // Virtual Joystick Logic
  const handleJoystickStart = (event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();
    setJoystickActive(true);
    handleHapticFeedback(ImpactStyle.Light);
  };

  const handleJoystickMove = (event: TouchEvent | MouseEvent) => {
    if (!joystickActive || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX: number, clientY: number;
    if (event instanceof TouchEvent) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = joystickSize / 2 - 10;

    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;

    if (distance > maxDistance) {
      normalizedX = (deltaX / distance) * (maxDistance / maxDistance);
      normalizedY = (deltaY / distance) * (maxDistance / maxDistance);
    }

    setJoystickPosition({ x: normalizedX, y: normalizedY });

    // Send input to game engine
    if (gameEngine) {
      const sensitivity = settings.controls.touchSensitivity;
      gameEngine.handleVirtualInput({
        left: normalizedX < -0.3 * sensitivity,
        right: normalizedX > 0.3 * sensitivity,
        up: normalizedY < -0.3 * sensitivity,
        down: normalizedY > 0.3 * sensitivity,
      });
    }
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPosition({ x: 0, y: 0 });
    
    if (gameEngine) {
      gameEngine.handleVirtualInput({
        left: false,
        right: false,
        up: false,
        down: false,
      });
    }
  };

  // Action Button Handlers
  const handleJumpStart = () => {
    if (gameEngine) {
      gameEngine.handleVirtualInput({ jump: true });
      handleHapticFeedback(ImpactStyle.Medium);
    }
  };

  const handleJumpEnd = () => {
    if (gameEngine) {
      gameEngine.handleVirtualInput({ jump: false });
    }
  };

  const handleRunStart = () => {
    if (gameEngine) {
      gameEngine.handleVirtualInput({ run: true });
      handleHapticFeedback(ImpactStyle.Light);
    }
  };

  const handleRunEnd = () => {
    if (gameEngine) {
      gameEngine.handleVirtualInput({ run: false });
    }
  };

  // Event Listeners
  useEffect(() => {
    const handleMove = (event: TouchEvent | MouseEvent) => {
      handleJoystickMove(event);
    };

    const handleEnd = () => {
      handleJoystickEnd();
    };

    if (joystickActive) {
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
    };
  }, [joystickActive]);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Virtual Joystick */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <div
          ref={joystickRef}
          className="relative bg-black/30 rounded-full border-2 border-white/20 backdrop-blur-sm"
          style={{ width: joystickSize, height: joystickSize }}
          onTouchStart={handleJoystickStart}
          onMouseDown={handleJoystickStart}
        >
          <div
            ref={joystickKnobRef}
            className="absolute bg-white/80 rounded-full shadow-lg transition-transform"
            style={{
              width: joystickSize * 0.4,
              height: joystickSize * 0.4,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${joystickPosition.x * (joystickSize / 2 - 10)}px, ${joystickPosition.y * (joystickSize / 2 - 10)}px)`,
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 flex space-x-3 pointer-events-auto">
        {/* Jump Button */}
        <button
          className="bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-full shadow-lg backdrop-blur-sm border-2 border-white/20 flex items-center justify-center font-bold text-lg touch-manipulation"
          style={{ width: buttonSize, height: buttonSize }}
          onTouchStart={handleJumpStart}
          onTouchEnd={handleJumpEnd}
          onMouseDown={handleJumpStart}
          onMouseUp={handleJumpEnd}
          aria-label="Jump"
        >
          ↑
        </button>

        {/* Run Button */}
        <button
          className="bg-green-500/80 hover:bg-green-600/80 text-white rounded-full shadow-lg backdrop-blur-sm border-2 border-white/20 flex items-center justify-center font-bold text-lg touch-manipulation"
          style={{ width: buttonSize, height: buttonSize }}
          onTouchStart={handleRunStart}
          onTouchEnd={handleRunEnd}
          onMouseDown={handleRunStart}
          onMouseUp={handleRunEnd}
          aria-label="Run"
        >
          ⚡
        </button>
      </div>

      {/* Control Instructions */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-xs text-center">
          <div className="flex items-center space-x-4">
            <span>🕹️ Move</span>
            <span>↑ Jump</span>
            <span>⚡ Run</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualControls;