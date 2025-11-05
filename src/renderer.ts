// This file runs in the renderer process

// Define the electronAPI interface
interface ElectronAPI {
  versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
    platform: () => string;
  };
}

// Extend the Window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  // Display version information using the exposed API
  replaceText('node-version', window.electronAPI.versions.node());
  replaceText('chrome-version', window.electronAPI.versions.chrome());
  replaceText('electron-version', window.electronAPI.versions.electron());
  replaceText('platform', window.electronAPI.versions.platform());
});

// Export to make this a module
export {};
