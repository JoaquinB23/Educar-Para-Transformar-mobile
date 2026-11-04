import type { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEVELOPMENT_BUILD = process.env.EAS_BUILD_PROFILE === "development";

const plugins: NonNullable<ExpoConfig["plugins"]> = [
  "expo-router",
  [
    "expo-splash-screen",
    {
      backgroundColor: "#0B4F6C",
      image: "./assets/images/splash-icon.png",
      imageWidth: 96,
    },
  ],
  "expo-notifications",
];

if (IS_DEVELOPMENT_BUILD) {
  plugins.push([
    "expo-build-properties",
    {
      android: {
        usesCleartextTraffic: true,
      },
    },
  ]);
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Educar para Transformar",
  slug: "educar-para-transformar",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "educar",
  userInterfaceStyle: "light",
  icon: "./assets/images/icon.png",
  android: {
    package: "com.transformarparaeducar.app",
    versionCode: 1,
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#0B4F6C",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  plugins,
  experiments: {
    typedRoutes: true,
  },
});
