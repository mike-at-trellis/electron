import { IMazeProvider, MazeData, Position } from './IMazeProvider';

/**
 * Fixed Maze Provider
 * Provides a hardcoded 16x16 maze suitable for young children
 */
export class FixedMazeProvider implements IMazeProvider {
  private mazeData: MazeData;

  constructor() {
    // 1 = wall, 0 = path
    // Designed to be fun and suitable for a 4-year-old
    const grid = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    ];

    this.mazeData = {
      width: 16,
      height: 16,
      grid: grid,
      startPosition: { x: 8, y: 8 }, // Center of the maze
      exitPosition: { x: 14, y: 15 }, // Near bottom-right corner
    };
  }

  getMazeData(): MazeData {
    return this.mazeData;
  }

  isWall(x: number, y: number): boolean {
    if (x < 0 || x >= this.mazeData.width || y < 0 || y >= this.mazeData.height) {
      return true; // Out of bounds is treated as a wall
    }
    return this.mazeData.grid[y][x] === 1;
  }

  getWidth(): number {
    return this.mazeData.width;
  }

  getHeight(): number {
    return this.mazeData.height;
  }

  getStartPosition(): Position {
    return { ...this.mazeData.startPosition };
  }

  getExitPosition(): Position {
    return { ...this.mazeData.exitPosition };
  }
}
