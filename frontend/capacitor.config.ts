import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.accessiblechennai.app',
  appName: 'Accessible Chennai',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://maps.googleapis.com',
      'https://api.openstreetmap.org'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2196f3',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#2196f3'
    },
    Keyboard: {
      resize: 'ionic'
    }
  }
};

export default config;
