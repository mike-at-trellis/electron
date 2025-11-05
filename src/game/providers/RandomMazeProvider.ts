import { IMazeProvider, MazeData, Position } from "./IMazeProvider";

export class RandomMazeProvider implements IMazeProvider {
  private mazeData: MazeData;

  constructor(width: number, height: number) {

    // Start should be a random cell in the upper left quadrant
    const startPosition: Position = {
      x: Math.floor(Math.random() * (width / 2)),
      y: Math.floor(Math.random() * (height / 2)),
    };

    // Exit should be a random cell in the bottom right quadrant
    const exitPosition: Position = {
      x: Math.floor(Math.random() * (width / 2)) + (width % 2 === 0 ? width / 2 : Math.floor(width / 2) ),
      y: Math.floor(Math.random() * (height / 2)) + (height % 2 === 0 ? height / 2 : Math.floor(height / 2) ),
    };

    const md: Partial<MazeData> = {
      width: width,
      height: height,
      startPosition: startPosition,
      exitPosition: exitPosition,
    };
    this.mazeData = md as MazeData;
    const grid = this.generateMazeGrid(width, height);
    this.mazeData.grid = grid;
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

  /**
   * Generate a random maze grid using Recursive Backtracking
   */
  private generateMazeGrid(width: number, height: number): number[][] {
    // Initialize grid with walls
    const grid: number[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 1)
    );

    // Simple seeded random number generator
    let rand = Math.random;

    const carvePassagesFrom = (cx: number, cy: number) => {
      const directions = [
        { x: 0, y: -2 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: -2, y: 0 },
      ];

      // Shuffle directions
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }

      for (const dir of directions) {
        const nx = cx + dir.x;
        const ny = cy + dir.y;

        if (nx > 0 && nx < width && ny > 0 && ny < height && grid[ny][nx] === 1) {
          grid[cy + dir.y / 2][cx + dir.x / 2] = 0; // Carve passage
          grid[ny][nx] = 0; // Carve new cell
          carvePassagesFrom(nx, ny);
        }
      }
    };

    grid[this.mazeData.startPosition.y][this.mazeData.startPosition.x] = 0;
    carvePassagesFrom(this.mazeData.startPosition.x, this.mazeData.startPosition.y);

    // Ensure exit is open
    grid[this.mazeData.exitPosition.y][this.mazeData.exitPosition.x] = 0;

    // Verify path exists and carve one if needed
    this.ensurePathToExit(grid, width, height);

    return grid;
  }

  /**
   * Use BFS to verify a path exists from start to exit.
   * If no path exists, carve a path to the exit.
   */
  private ensurePathToExit(grid: number[][], width: number, height: number): void {
    const start = this.mazeData.startPosition;
    const exit = this.mazeData.exitPosition;

    // BFS to check if exit is reachable
    const visited = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => false)
    );
    const queue: Position[] = [start];
    visited[start.y][start.x] = true;
    const parent: Map<string, Position> = new Map();

    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    let exitReachable = false;

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.x === exit.x && current.y === exit.y) {
        exitReachable = true;
        break;
      }

      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;

        if (
          nx >= 0 &&
          nx < width &&
          ny >= 0 &&
          ny < height &&
          !visited[ny][nx] &&
          grid[ny][nx] === 0
        ) {
          visited[ny][nx] = true;
          queue.push({ x: nx, y: ny });
          parent.set(`${nx},${ny}`, current);
        }
      }
    }

    // If exit is not reachable, carve a path
    if (!exitReachable) {
      this.carvePath(grid, start, exit);
    }
  }

  /**
   * Carve a path from start to exit using a simple algorithm
   */
  private carvePath(
    grid: number[][],
    start: Position,
    exit: Position
  ): void {
    let current = { ...start };

    // Simple greedy path: move towards exit
    while (current.x !== exit.x || current.y !== exit.y) {
      grid[current.y][current.x] = 0;

      // Move horizontally first
      if (current.x < exit.x) {
        current.x++;
      } else if (current.x > exit.x) {
        current.x--;
      }
      // Then vertically
      else if (current.y < exit.y) {
        current.y++;
      } else if (current.y > exit.y) {
        current.y--;
      }

      grid[current.y][current.x] = 0;
    }

    // Ensure exit is open
    grid[exit.y][exit.x] = 0;
  }
}