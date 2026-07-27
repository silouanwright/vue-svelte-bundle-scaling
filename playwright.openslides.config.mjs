import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "openslides-parity.spec.mjs",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    headless: true,
    trace: "retain-on-failure",
    viewport: { width: 1440, height: 960 },
  },
  webServer: [
    {
      command:
        "npm exec vite -- fixtures/openslides/vue --config fixtures/openslides/vue/vite.config.ts --host 127.0.0.1 --port 4474",
      port: 4474,
      reuseExistingServer: false,
    },
    {
      command:
        "npm exec vite -- fixtures/openslides/svelte --config fixtures/openslides/svelte/vite.config.ts --host 127.0.0.1 --port 4475",
      port: 4475,
      reuseExistingServer: false,
    },
  ],
});
