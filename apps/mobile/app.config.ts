import { ExpoConfig, ConfigContext } from 'expo/config';

function tryResolve(pkg: string): boolean {
  try {
    (require as any).resolve(pkg);
    return true;
  } catch {
    return false;
  }
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'AgrIntel Mobile',
  slug: 'agri-intelligence',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icons/icon.png',
  scheme: 'agrintel',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'et.gov.moa.agrintel',
    infoPlist: {
      NSCameraUsageDescription: 'AgrIntel requires camera access for crop leaf pest and disease diagnostics.',
      NSMicrophoneUsageDescription: 'AgrIntel requires microphone access for voice box grievances and voice-guided navigation.',
      NSLocationWhenInUseUsageDescription: 'AgrIntel captures GPS coordinates to classify agro-ecological zones and plot boundaries.',
    },
  },
  android: {
    package: 'et.gov.moa.agrintel',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/icons/adaptive-icon.png',
      backgroundColor: '#16A34A',
    },
    permissions: [
      'CAMERA',
      'RECORD_AUDIO',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'POST_NOTIFICATIONS',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
    ],
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/icons/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#16A34A',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow AgrIntel to take photos of damaged crops for pest diagnostics.',
        microphonePermission: 'Allow AgrIntel to record voice alongside pest captures.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Allow AgrIntel to capture parcel coordinates for plot registration.',
      },
    ],
    [
      'expo-av',
      {
        microphonePermission: 'Allow AgrIntel to record audio grievances and questions in Ethiopian languages.',
      },
    ],
    // Only include native Firebase plugins if the packages are installed
    ...(tryResolve('@react-native-firebase/app') ? ['@react-native-firebase/app'] : []),
    ...(tryResolve('@react-native-firebase/messaging') ? ['@react-native-firebase/messaging'] : []),
  ],
  extra: {
    eas: {
      projectId: 'agrintel-pilot-adama',
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.agrintel.gov.et',
    imageMaxUploadBytes: 409600, // 400 KB enforced
  },
});
