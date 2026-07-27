import { fileURLToPath } from "node:url";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: "../../../.work-weather-staged/vite-svelte",
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
  plugins: [svelte({ compilerOptions: { discloseVersion: false } })],
});
