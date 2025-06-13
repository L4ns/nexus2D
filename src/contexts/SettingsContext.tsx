import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePlatform } from './PlatformContext';

export interface GameSettings {
  graphics: {
    resolution: 'auto' | 'low' | 'medium' | 'high';
    particleEffects: boolean;
    shadows: boolean;
    antiAliasing: boolean;
    targetFPS: 30 | 60;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  };
  controls: {
    touchSensitivity: number;
    hapticFeedback: boolean;
    virtualJoystickSize: number;
    buttonSize: number;
    keyboardLayout: 'wasd' | 'arrows';
  };
  gameplay: {
    difficulty: 'easy' | 'normal' | 'hard';
    autoSave: boolean;
    showTutorials: boolean;
    pauseOnFocusLoss: boolean;
  };
}

interface SettingsContextType {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: GameSettings = {
  graphics: {
    resolution: 'auto',
    particleEffects: true,
    shadows: true,
    antiAliasing: true,
    targetFPS: 60,
  },
  audio: {
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 0.8,
    muted: false,
  },
  controls: {
    touchSensitivity: 1.0,
    hapticFeedback: true,
    virtualJoystickSize: 1.0,
    buttonSize: 1.0,
    keyboardLayout: 'wasd',
  },
  gameplay: {
    difficulty: 'normal',
    autoSave: true,
    showTutorials: true,
    pauseOnFocusLoss: true,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { platform } = usePlatform();
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);

  useEffect(() => {
    // Load settings from storage
    const loadSettings = async () => {
      try {
        const savedSettings = localStorage.getItem('nexus-platformer-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.warn('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    // Adjust default settings based on platform
    const platformOptimizedSettings = { ...settings };

    if (platform.isMobile) {
      // Optimize for mobile performance
      platformOptimizedSettings.graphics.targetFPS = 30;
      platformOptimizedSettings.graphics.particleEffects = false;
      platformOptimizedSettings.graphics.shadows = false;
      platformOptimizedSettings.graphics.antiAliasing = false;
    } else if (platform.isDesktop) {
      // Enable all features for desktop
      platformOptimizedSettings.graphics.targetFPS = 60;
      platformOptimizedSettings.graphics.particleEffects = true;
      platformOptimizedSettings.graphics.shadows = true;
      platformOptimizedSettings.graphics.antiAliasing = true;
    }

    if (!platform.supportsHaptics) {
      platformOptimizedSettings.controls.hapticFeedback = false;
    }

    setSettings(platformOptimizedSettings);
  }, [platform]);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    const updatedSettings = {
      ...settings,
      ...newSettings,
      graphics: { ...settings.graphics, ...newSettings.graphics },
      audio: { ...settings.audio, ...newSettings.audio },
      controls: { ...settings.controls, ...newSettings.controls },
      gameplay: { ...settings.gameplay, ...newSettings.gameplay },
    };

    setSettings(updatedSettings);

    // Save to storage
    try {
      localStorage.setItem('nexus-platformer-settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('nexus-platformer-settings');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};