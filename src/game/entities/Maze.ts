import Phaser from 'phaser';
import { IMazeProvider } from '../providers/IMazeProvider';

/**
 * Maze Configuration for skinnable appearance
 */
export interface MazeConfig {
  cellSize: number;
  wallColors: number[]; // Rainbow colors for walls
  pathColor: number;
  exitColor: number;
  startColor: number;
}

/**
 * Maze Entity
 * Renders the maze with skinnable walls and paths
 */
export class Maze {
  private scene: Phaser.Scene;
  private provider: IMazeProvider;
  private config: MazeConfig;
  private graphics!: Phaser.GameObjects.Graphics;
  private cellSize: number;

  constructor(scene: Phaser.Scene, provider: IMazeProvider, config?: Partial<MazeConfig>) {
    this.scene = scene;
    this.provider = provider;

    // Default rainbow configuration suitable for a 4-year-old
    this.config = {
      cellSize: config?.cellSize || 40,
      wallColors: config?.wallColors || [
        0xff6b6b, // Red
        0xffa500, // Orange
        0xffff00, // Yellow
        0x4ecdc4, // Turquoise
        0x45b7d1, // Light blue
        0x6c5ce7, // Purple
        0xff85c0, // Pink
      ],
      pathColor: config?.pathColor || 0xf0f0f0, // Light gray path
      exitColor: config?.exitColor || 0x00ff00, // Bright green for exit
      startColor: config?.startColor || 0xffff00, // Yellow for start
    };

    this.cellSize = this.config.cellSize;
    this.createGraphics();
  }

  /**
   * Create the graphics object and render the maze
   */
  private createGraphics(): void {
    this.graphics = this.scene.add.graphics();
    this.render();
  }

  /**
   * Render the complete maze
   */
  render(): void {
    this.graphics.clear();

    const mazeData = this.provider.getMazeData();

    // Render all cells
    for (let y = 0; y < mazeData.height; y++) {
      for (let x = 0; x < mazeData.width; x++) {
        const isWall = this.provider.isWall(x, y);
        const isExit = x === mazeData.exitPosition.x && y === mazeData.exitPosition.y;
        const isStart = x === mazeData.startPosition.x && y === mazeData.startPosition.y;

        if (isExit) {
          this.drawCell(x, y, this.config.exitColor);
        } else if (isStart) {
          this.drawCell(x, y, this.config.startColor);
        } else if (isWall) {
          // Use rainbow colors for walls (cycle through the array)
          const colorIndex = (x + y) % this.config.wallColors.length;
          this.drawCell(x, y, this.config.wallColors[colorIndex]);
        } else {
          this.drawCell(x, y, this.config.pathColor);
        }
      }
    }
  }

  /**
   * Draw a single cell at grid position
   */
  private drawCell(gridX: number, gridY: number, color: number): void {
    const x = gridX * this.cellSize;
    const y = gridY * this.cellSize;

    this.graphics.fillStyle(color, 1);
    this.graphics.fillRect(x, y, this.cellSize, this.cellSize);

    // Add a subtle border for better visibility
    this.graphics.lineStyle(1, 0xffffff, 0.2);
    this.graphics.strokeRect(x, y, this.cellSize, this.cellSize);
  }

  /**
   * Get the pixel position from grid coordinates
   */
  gridToPixel(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.cellSize + this.cellSize / 2,
      y: gridY * this.cellSize + this.cellSize / 2,
    };
  }

  /**
   * Get the grid position from pixel coordinates
   */
  pixelToGrid(pixelX: number, pixelY: number): { x: number; y: number } {
    return {
      x: Math.floor(pixelX / this.cellSize),
      y: Math.floor(pixelY / this.cellSize),
    };
  }

  /**
   * Get the cell size
   */
  getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Get the maze provider
   */
  getProvider(): IMazeProvider {
    return this.provider;
  }

  /**
   * Destroy the maze graphics
   */
  destroy(): void {
    this.graphics.destroy();
  }
}
