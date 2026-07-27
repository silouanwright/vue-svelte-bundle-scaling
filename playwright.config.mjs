import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
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
        "npm exec vite -- fixtures/hand-authored/vue --config fixtures/hand-authored/vue/vite.config.js --host 127.0.0.1 --port 4274",
      port: 4274,
      reuseExistingServer: false,
    },
    {
      command:
        "npm exec vite -- fixtures/hand-authored/svelte --config fixtures/hand-authored/svelte/vite.config.js --host 127.0.0.1 --port 4275",
      port: 4275,
      reuseExistingServer: false,
    },
  ],
});
