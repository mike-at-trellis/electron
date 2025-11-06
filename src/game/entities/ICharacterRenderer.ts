import Phaser from 'phaser';
import { Direction } from './MovementController';

/**
 * Character Renderer Interface
 * Defines the contract for different character appearances/skins
 */
export interface ICharacterRenderer {
  /**
   * The Phaser container holding all visual elements
   * Movement controller will animate this container
   */
  readonly container: Phaser.GameObjects.Container;

  /**
   * Update the character's visual direction
   * Called when the character changes facing direction
   * @param direction - The new direction the character is facing
   */
  setDirection(direction: Direction): void;

  /**
   * Play walk animation
   * Called when character successfully moves
   * Can include bouncing, scaling, sprite frame changes, etc.
   */
  playWalkAnimation(): void;

  /**
   * Play bounce animation
   * Called when character hits a wall
   * @param direction - The direction that was blocked
   * @param baseX - The true X position to bounce from (in pixels)
   * @param baseY - The true Y position to bounce from (in pixels)
   */
  playBounceAnimation(direction: Direction, baseX: number, baseY: number): void;

  /**
   * Set sparkle/particle effect intensity
   * @param multiplier - Intensity multiplier (1 = normal, 2 = double, etc.)
   */
  setSparkleIntensity(multiplier: number): void;

  /**
   * Clean up resources
   */
  destroy(): void;
}
