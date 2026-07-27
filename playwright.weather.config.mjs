import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "weather-staged-parity.spec.mjs",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "npm exec vite -- fixtures/weather-staged/vue --config fixtures/weather-staged/vue/vite.config.js --host 127.0.0.1 --port 4374",
      port: 4374,
      reuseExistingServer: false,
    },
    {
      command:
        "npm exec vite -- fixtures/weather-staged/svelte --config fixtures/weather-staged/svelte/vite.config.js --host 127.0.0.1 --port 4375",
      port: 4375,
      reuseExistingServer: false,
    },
  ],
});
