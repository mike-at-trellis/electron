import Phaser from 'phaser';
import { Maze } from './Maze';

/**
 * Direction enum for character movement
 */
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * Movement Controller
 * Handles grid-based movement logic independent of character appearance
 */
export class MovementController {
  private scene: Phaser.Scene;
  private maze: Maze;
  private container: Phaser.GameObjects.Container;
  private gridX: number;
  private gridY: number;
  private isMovingFlag: boolean = false;
  private moveTween?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    maze: Maze,
    container: Phaser.GameObjects.Container,
    startGridX: number,
    startGridY: number
  ) {
    this.scene = scene;
    this.maze = maze;
    this.container = container;
    this.gridX = startGridX;
    this.gridY = startGridY;

    // Position container at start position
    const startPos = maze.gridToPixel(startGridX, startGridY);
    this.container.setPosition(startPos.x, startPos.y);
  }

  /**
   * Attempt to move in a direction
   * @param direction - Direction to move
   * @param onMoveStart - Callback when movement starts (for visual direction update)
   * @param onMoveComplete - Callback when movement completes
   * @param onBlocked - Callback when movement is blocked by a wall (receives direction and current pixel position)
   * @returns true if move succeeded, false if blocked
   */
  move(
    direction: Direction,
    onMoveStart?: (direction: Direction) => void,
    onMoveComplete?: () => void,
    onBlocked?: (direction: Direction, baseX: number, baseY: number) => void
  ): boolean {
    if (this.isMovingFlag) {
      return false;
    }

    // Stop any existing movement tween
    if (this.moveTween) {
      this.moveTween.stop();
      this.moveTween = undefined;
    }

    // Calculate new position
    let newGridX = this.gridX;
    let newGridY = this.gridY;

    switch (direction) {
      case Direction.UP:
        newGridY--;
        break;
      case Direction.DOWN:
        newGridY++;
        break;
      case Direction.LEFT:
        newGridX--;
        break;
      case Direction.RIGHT:
        newGridX++;
        break;
    }

    // Check for wall collision
    if (this.maze.getProvider().isWall(newGridX, newGridY)) {
      // Notify blocked by wall, passing current grid position in pixels
      if (onBlocked) {
        const currentPos = this.maze.gridToPixel(this.gridX, this.gridY);
        onBlocked(direction, currentPos.x, currentPos.y);
      }
      return false;
    }

    // Update grid position
    this.gridX = newGridX;
    this.gridY = newGridY;

    // Notify movement started
    if (onMoveStart) {
      onMoveStart(direction);
    }

    const newPos = this.maze.gridToPixel(newGridX, newGridY);
    this.isMovingFlag = true;

    // Animate movement
    this.moveTween = this.scene.tweens.add({
      targets: this.container,
      x: newPos.x,
      y: newPos.y,
      duration: 150,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.isMovingFlag = false;
        if (onMoveComplete) {
          onMoveComplete();
        }
      },
    });

    return true;
  }

  /**
   * Get current grid position (logical position)
   */
  getGridPosition(): { x: number; y: number } {
    return { x: this.gridX, y: this.gridY };
  }

  /**
   * Get current pixel position (visual position, may be animating)
   */
  getPixelPosition(): { x: number; y: number } {
    return {
      x: this.container.x,
      y: this.container.y,
    };
  }

  /**
   * Check if currently moving (animation in progress)
   */
  isMoving(): boolean {
    return this.isMovingFlag;
  }

  /**
   * Get the maze cell size
   */
  getCellSize(): number {
    return this.maze.getCellSize();
  }

  /**
   * Refresh the container's pixel position after a maze cell size change.
   */
  refreshPosition(): void {
    const pos = this.maze.gridToPixel(this.gridX, this.gridY);
    this.container.setPosition(pos.x, pos.y);
  }

  /**
   * Clean up tweens
   */
  destroy(): void {
    if (this.moveTween) {
      this.moveTween.stop();
      this.moveTween = undefined;
    }
  }
}
