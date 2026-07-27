import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: fileURLToPath(
    new URL("../../../node_modules/.vite/hand-authored-vue", import.meta.url),
  ),
  plugins: [vue()],
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
