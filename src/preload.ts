import { contextBridge } from 'electron';

// Expose protected methods that allow the renderer process to use
// select Node.js features without exposing the entire Node.js API
contextBridge.exposeInMainWorld('electronAPI', {
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    platform: () => process.platform,
  },
});
