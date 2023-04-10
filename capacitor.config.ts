import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'merchant app',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    allowNavigation: [
      "*",
      "http://192.169.2.169:8100",
      "http://172.27.94.1:8100",
      "http://192.168.1.112:8100",
      "http://192.169.2.154:8100",
      "http://192.168.0.234:8100",
      "https://mmwalletapp.ezeemoney.biz:4322/*",
      "http://10.168.3.166:8100/*"
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 1000,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "mechant_app",
      useDialog: true,
    },
    InAppBrowser: {
        ios: {
          usewkwebview: true
        }
      }
    
  
  },

};

export default config;
