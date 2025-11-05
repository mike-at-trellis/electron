import Phaser from 'phaser';
import { IMazeProvider } from '../providers/IMazeProvider';
import * as Colors from './characters/ColorConstants';

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
        Colors.RED_CORAL,       // Red
        Colors.ORANGE_BRIGHT,   // Orange
        Colors.YELLOW,          // Yellow
        Colors.TURQUOISE,       // Turquoise
        Colors.LIGHT_BLUE_SKY,  // Light blue
        Colors.DEEP_PURPLE,     // Purple
        Colors.LIGHTER_PINK,    // Pink
      ],
      pathColor: config?.pathColor || Colors.DARK_GRAY_PATH,  // Darker grey
      exitColor: config?.exitColor || Colors.BRIGHT_GREEN,    // Bright green for exit
      startColor: config?.startColor || Colors.DARK_GRAY_PATH, // Same as path
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
    this.graphics.lineStyle(1, Colors.WHITE, 0.2);
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
   * Update the cell size and re-render the maze.
   */
  setCellSize(newSize: number): void {
    if (newSize <= 0) return;
    if (this.cellSize !== newSize) {
      this.cellSize = newSize;
      this.render();
    }
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
