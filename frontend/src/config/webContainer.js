import { WebContainer } from '@webcontainer/api';
// frontend/src/config/webcontainer.js

// Pull values from Vite env if you need them
const API_BASE = import.meta?.env?.VITE_API_BASE || "";
const WEB_CONTAINER_ENABLED =
  (import.meta?.env?.VITE_WEB_CONTAINER_ENABLED || "false").toLowerCase() === "true";

// Minimal, safe defaults so builds never break
const webcontainer = {
  enabled: WEB_CONTAINER_ENABLED, // boolean
  baseUrl: API_BASE,              // e.g. your backend URL
  projectId: "",                  // fill if your UI expects it
  token: "",                      // fill if your UI expects it
  wsUrl: "",                      // e.g. websocket endpoint if any
  iframeOrigin: "",               // e.g. https://stackblitz.com if you embed
};

export default webcontainer;

let webContainerInstance = null;

export const getWebContainer = async () => {
    if (webContainerInstance === null) {
        webContainerInstance = await WebContainer.boot();
    }
    return webContainerInstance;
}



