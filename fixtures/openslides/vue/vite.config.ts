import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vue({
      features: {
        optionsAPI: false,
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "$lib": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },
  worker: {
    format: "es",
  },
  server: {
    port: 1421,
    strictPort: true,
  },
  build: {
    target: "esnext",
    minify: "terser",
    sourcemap: false,
    cssCodeSplit: true,
    manifest: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
