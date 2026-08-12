import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.prepsathi.app",
  appName: "PrepSathi",
  webDir: "public",

  server: {
    url: "https://prep-sathi.vercel.app",
    cleartext: false,
  },
};

export default config;