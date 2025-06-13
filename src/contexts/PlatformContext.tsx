import React, { createContext, useContext, useEffect, useState } from 'react';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export interface PlatformInfo {
  platform: 'web' | 'ios' | 'android' | 'electron';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  hasTouch: boolean;
  supportsHaptics: boolean;
  supportsGamepad: boolean;
}

interface PlatformContextType {
  platform: PlatformInfo;
  updateScreenSize: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platform, setPlatform] = useState<PlatformInfo>({
    platform: 'web',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    hasTouch: 'ontouchstart' in window,
    supportsHaptics: false,
    supportsGamepad: 'getGamepads' in navigator,
  });

  const updateScreenSize = () => {
    setPlatform(prev => ({
      ...prev,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    }));
  };

  useEffect(() => {
    const initializePlatform = async () => {
      let platformType: PlatformInfo['platform'] = 'web';
      let supportsHaptics = false;

      if (Capacitor.isNativePlatform()) {
        const deviceInfo = await Device.getInfo();
        platformType = deviceInfo.platform as 'ios' | 'android';
        supportsHaptics = true;
      } else if ((window as any).electronAPI) {
        platformType = 'electron';
      }

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isMobile = screenWidth < 768 || 'ontouchstart' in window;
      const isTablet = screenWidth >= 768 && screenWidth < 1024 && 'ontouchstart' in window;
      const isDesktop = !isMobile && !isTablet;

      setPlatform({
        platform: platformType,
        isMobile,
        isTablet,
        isDesktop,
        screenWidth,
        screenHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        hasTouch: 'ontouchstart' in window,
        supportsHaptics,
        supportsGamepad: 'getGamepads' in navigator,
      });
    };

    initializePlatform();

    window.addEventListener('resize', updateScreenSize);
    window.addEventListener('orientationchange', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
      window.removeEventListener('orientationchange', updateScreenSize);
    };
  }, []);

  return (
    <PlatformContext.Provider value={{ platform, updateScreenSize }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};