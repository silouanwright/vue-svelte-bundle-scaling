import { fileURLToPath, URL } from "node:url";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: fileURLToPath(
    new URL("../../../node_modules/.vite/hand-authored-svelte", import.meta.url),
  ),
  plugins: [svelte()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
    minify: "oxc",
    sourcemap: false,
    reportCompressedSize: false,
  },
});
