/**
 * Maze Provider Interface
 * Defines the contract for different maze generation strategies
 */

export interface Position {
  x: number;
  y: number;
}

export interface MazeData {
  width: number;
  height: number;
  grid: number[][]; // 0 = path, 1 = wall
  startPosition: Position;
  exitPosition: Position;
}

export interface IMazeProvider {
  /**
   * Get the maze data including dimensions, grid, start and exit positions
   */
  getMazeData(): MazeData;

  /**
   * Check if a specific cell is a wall
   * @param x - X coordinate in grid
   * @param y - Y coordinate in grid
   */
  isWall(x: number, y: number): boolean;

  /**
   * Get the width of the maze in cells
   */
  getWidth(): number;

  /**
   * Get the height of the maze in cells
   */
  getHeight(): number;

  /**
   * Get the starting position for the character
   */
  getStartPosition(): Position;

  /**
   * Get the exit position for the maze
   */
  getExitPosition(): Position;
}
