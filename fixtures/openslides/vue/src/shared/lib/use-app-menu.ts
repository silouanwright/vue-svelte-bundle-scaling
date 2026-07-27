import { onBeforeUnmount, onMounted } from "vue";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { AppMenuEvent } from "./app-menu";

export type AppMenuHandlers = Partial<Record<AppMenuEvent, () => void>>;

/** Subscribe a Vue route to the native application-menu event contract. */
export function useAppMenu(handlers: AppMenuHandlers): void {
  const unlisten: UnlistenFn[] = [];
  let disposed = false;

  onMounted(() => {
    void (async () => {
      for (const [event, handler] of Object.entries(handlers) as Array<
        [AppMenuEvent, () => void]
      >) {
        try {
          const remove = await listen(event, handler);
          if (disposed) remove();
          else unlisten.push(remove);
        } catch {
          // The web build intentionally runs without the native event plugin.
        }
      }
    })();
  });

  onBeforeUnmount(() => {
    disposed = true;
    unlisten.splice(0).forEach((remove) => remove());
  });
}
