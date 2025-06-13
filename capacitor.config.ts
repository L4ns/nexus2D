import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexus.platformer',
  appName: 'Nexus Platformer',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e1b4b',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1e1b4b'
    },
    Haptics: {
      enabled: true
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true,
    captureInput: true
  }
};

export default config;