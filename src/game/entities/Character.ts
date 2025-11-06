import Phaser from 'phaser';
import { Maze } from './Maze';
import { MovementController, Direction } from './MovementController';
import { ICharacterRenderer } from './ICharacterRenderer';

// Re-export Direction for backward compatibility
export { Direction };

/**
 * Character Entity
 * Composition of movement logic and visual renderer
 * Allows different character skins with shared movement behavior
 */
export class Character {
  private movementController: MovementController;
  private renderer: ICharacterRenderer;

  constructor(
    scene: Phaser.Scene,
    maze: Maze,
    renderer: ICharacterRenderer,
    startGridX: number,
    startGridY: number
  ) {
    this.renderer = renderer;

    // Create movement controller using the renderer's container
    this.movementController = new MovementController(
      scene,
      maze,
      renderer.container,
      startGridX,
      startGridY
    );
  }

  /**
   * Move the character in a direction
   * @param direction - Direction to move
   * @param onComplete - Callback when movement completes
   * @param duration - Duration of the movement animation in milliseconds (default: 150)
   * @returns true if move succeeded, false if blocked by wall
   */
  move(direction: Direction, onComplete?: () => void, duration: number = 150): boolean {
    return this.movementController.move(
      direction,
      (dir) => {
        // Update visual direction when movement starts
        this.renderer.setDirection(dir);
      },
      () => {
        // Play walk animation when movement completes
        this.renderer.playWalkAnimation();
        // Call user callback
        if (onComplete) {
          onComplete();
        }
      },
      (dir, baseX, baseY) => {
        // Play bounce animation when blocked by wall
        this.renderer.playBounceAnimation(dir, baseX, baseY);
      },
      duration
    );
  }

  /**
   * Get current grid position (logical position)
   * Use this for game logic like collision detection, victory conditions, etc.
   */
  getGridPosition(): { x: number; y: number } {
    return this.movementController.getGridPosition();
  }

  /**
   * Get current pixel position (visual position)
   * Use this for visual effects like mini-map rendering
   */
  getPixelPosition(): { x: number; y: number } {
    return this.movementController.getPixelPosition();
  }

  /**
   * Check if character is currently moving (animation in progress)
   */
  getIsMoving(): boolean {
    return this.movementController.isMoving();
  }

  /**
   * Get the character renderer for accessing visual effects
   */
  getRenderer(): ICharacterRenderer {
    return this.renderer;
  }

  /**
   * Realign the character after a cell size change.
   */
  refreshPosition(): void {
    this.movementController.refreshPosition();
  }

  /**
   * Resize the character renderer for a new cell size (if supported) without losing state.
   */
  resizeForCellSize(newCellSize: number): void {
    type Resizable = { resizeForCellSize: (size: number) => void };
    const maybeResizable = this.renderer as unknown as Partial<Resizable>;
    if (typeof maybeResizable.resizeForCellSize === 'function') {
      maybeResizable.resizeForCellSize(newCellSize);
    }
  }

  /**
   * Destroy the character
   */
  destroy(): void {
    this.movementController.destroy();
    this.renderer.destroy();
  }
}
