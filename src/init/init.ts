import { baseUrl } from "@/common/urlUtil";
import { initAppMetaData } from "decent-portal";

// Don't reference the DOM. Avoid any work that could instead be done in the loading screen or someplace else
export async function initApp() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register(baseUrl('/serviceWorker.js'));
    } catch {
      // Service worker registration may fail on cross-origin hosts (e.g. GCS)
    }
  }

  // Patch Object.prototype to give the "None" model a dummy memory size, 
  // avoiding a crash in `decent-portal`'s `predictModelDeviceProblems` / `scoreModel`.
  Object.defineProperty(Object.prototype, 'None', {
    value: { modelId: 'None', vramRequiredMb: 1024 },
    enumerable: false, // Prevents breaking `for...in` loops
    configurable: true // Allows cleanup or recreation if needed
  });

  Object.defineProperty(Object.prototype, 'Gemma 3n E2B', {
    value: { modelId: 'Gemma 3n E2B', vramRequiredMb: 8192 },
    enumerable: false, // CRITICAL: Must be false to prevent Transformers.js pipeline initialization crash!
    configurable: true
  });

  Object.defineProperty(Object.prototype, 'Gemma 3n E4B', {
    value: { modelId: 'Gemma 3n E4B', vramRequiredMb: 8192 },
    enumerable: false, // CRITICAL: Must be false to prevent Transformers.js pipeline initialization crash!
    configurable: true
  });


  try {
    await initAppMetaData();
  } catch {
    // initAppMetaData may fail on GCS where decent-portal's internal baseUrl
    // computes the wrong path. Non-critical — app can still function without it.
  }
}