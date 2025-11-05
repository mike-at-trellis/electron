// This file runs in the renderer process
import Phaser from 'phaser';
import { StartMenuScene } from './game/scenes/StartMenuScene';
import { MainGameScene } from './game/scenes/MainGameScene';

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
  // Get window dimensions
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Initialize Phaser game
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: [StartMenuScene, MainGameScene],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  const game = new Phaser.Game(config);

  console.log('🎮 Rainbow Maze Adventure started!');
  console.log('Platform:', window.electronAPI.versions.platform());
  console.log('Electron:', window.electronAPI.versions.electron());
});

// Export to make this a module
export {};
