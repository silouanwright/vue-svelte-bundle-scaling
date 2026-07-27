import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import App from "./app/App.vue";
import { router } from "./app/router";
import { queryClient } from "$lib/queries/query-client";
import { installAppMenu } from "$lib/lib/app-menu";
import { initBackendConfig } from "$lib/lib/backend-config";
import { flushPendingSave } from "$lib/lib/code-save";
import { initInitialTheme } from "$lib/stores/ui-persistence";
import "./index.css";

initInitialTheme();
document.documentElement.setAttribute("data-gramm", "false");
document.documentElement.setAttribute("data-gramm_editor", "false");
document.documentElement.setAttribute("data-enable-grammarly", "false");
void installAppMenu();
void initBackendConfig();
void listen("app://quit-request", async () => {
  await flushPendingSave();
  await invoke("finish_quit");
});
window.addEventListener("beforeunload", () => void flushPendingSave());

createApp(App)
  .use(router)
  .use(VueQueryPlugin, { queryClient })
  .mount("#app");
