import { getCurrentWindow } from "@tauri-apps/api/window";
import { onBeforeUnmount, onMounted } from "vue";

export function usePresentationFullscreen(onExit: () => void) {
  let enteredFullscreen = false;

  async function enterFullscreen() {
    const root = document.getElementById("openslides-present-root");
    try {
      if (root?.requestFullscreen && !document.fullscreenElement) {
        await root.requestFullscreen();
        enteredFullscreen = true;
        return;
      }
    } catch {
      // Native Tauri fullscreen is the fallback.
    }
    try {
      const currentWindow = getCurrentWindow();
      if (!(await currentWindow.isFullscreen())) {
        await currentWindow.setFullscreen(true);
      }
      enteredFullscreen = true;
    } catch {
      // The overlay remains usable in an ordinary browser window.
    }
  }

  async function exitFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      // Continue with the native window fallback.
    }
    try {
      const currentWindow = getCurrentWindow();
      if (await currentWindow.isFullscreen()) {
        await currentWindow.setFullscreen(false);
      }
    } catch {
      // No native window exists in browser-only development and tests.
    }
  }

  function syncFullscreenExit() {
    if (enteredFullscreen && !document.fullscreenElement) onExit();
  }

  onMounted(() => {
    document.addEventListener("fullscreenchange", syncFullscreenExit);
    window.setTimeout(() => void enterFullscreen(), 50);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("fullscreenchange", syncFullscreenExit);
    void exitFullscreen();
  });

  return { enterFullscreen, exitFullscreen };
}
