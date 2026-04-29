import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() || "https://liftlog.example.com";

const config: CapacitorConfig = {
  appId: "com.liftlog.app",
  appName: "LiftLog",
  backgroundColor: "#111315",
  loggingBehavior: "debug",
  webDir: "capacitor-shell",
  server: {
    cleartext: false,
    errorPath: "error.html",
    url: serverUrl,
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
