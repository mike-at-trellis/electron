// This file runs in the renderer process

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  // Display version information
  replaceText('node-version', process.versions.node);
  replaceText('chrome-version', process.versions.chrome);
  replaceText('electron-version', process.versions.electron);
  replaceText('platform', process.platform);
});
