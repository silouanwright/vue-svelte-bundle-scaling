import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: "../../../.work-weather-staged/vite-vue",
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
  plugins: [vue({ features: { optionsAPI: false } })],
});
