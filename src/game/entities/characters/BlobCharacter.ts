import Phaser from 'phaser';
import { ICharacterRenderer } from '../ICharacterRenderer';
import { Direction } from '../MovementController';

/**
 * Color configuration for BlobCharacter
 */
export interface BlobColorConfig {
  bodyPrimary: number;      // Main body color
  bodySecondary: number;    // Overlay/gradient color
  bodyHighlight: number;    // Highlight color
  eyeWhite: number;         // Eye white color
  eyePupil: number;         // Eye pupil color
  mouth: number;            // Mouth color
}

/**
 * Blob Character Renderer
 * A cute programmatically drawn blob character with eyes and smile
 */
export class BlobCharacter implements ICharacterRenderer {
  readonly container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private cellSize: number;
  private colorConfig: BlobColorConfig;
  private body: Phaser.GameObjects.Graphics;
  private leftEye: Phaser.GameObjects.Graphics;
  private rightEye: Phaser.GameObjects.Graphics;
  private mouth: Phaser.GameObjects.Graphics;
  private direction: Direction = Direction.DOWN;
  private walkTween?: Phaser.Tweens.Tween;
  private bounceTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, cellSize: number, colorConfig: BlobColorConfig) {
    this.scene = scene;
    this.cellSize = cellSize;
    this.colorConfig = colorConfig;

    // Create container
    this.container = scene.add.container(0, 0);
    this.container.setDepth(10);

    // Create body (colorful blob)
    this.body = scene.add.graphics();
    this.drawBody();

    // Create eyes
    this.leftEye = scene.add.graphics();
    this.rightEye = scene.add.graphics();
    this.drawEyes();

    // Create mouth
    this.mouth = scene.add.graphics();
    this.drawMouth();

    // Add all parts to container
    this.container.add([this.body, this.leftEye, this.rightEye, this.mouth]);
  }

  /**
   * Draw the character body with configured colors
   */
  private drawBody(): void {
    this.body.clear();

    const radius = this.cellSize * 0.35;

    // Main body with primary color
    this.body.fillStyle(this.colorConfig.bodyPrimary, 1);
    this.body.fillCircle(0, 0, radius);

    // Add a cute gradient effect with secondary color
    this.body.fillStyle(this.colorConfig.bodySecondary, 0.6);
    this.body.fillCircle(-radius * 0.2, -radius * 0.2, radius * 0.8);

    // Add a highlight
    this.body.fillStyle(this.colorConfig.bodyHighlight, 0.4);
    this.body.fillCircle(-radius * 0.3, -radius * 0.3, radius * 0.4);
  }

  /**
   * Draw the character eyes based on direction
   */
  private drawEyes(): void {
    this.leftEye.clear();
    this.rightEye.clear();

    const eyeSize = this.cellSize * 0.08;
    const eyeSpacing = this.cellSize * 0.15;

    let leftEyeX = -eyeSpacing;
    let leftEyeY = -this.cellSize * 0.05;
    let rightEyeX = eyeSpacing;
    let rightEyeY = -this.cellSize * 0.05;

    // Adjust eye position based on direction
    switch (this.direction) {
      case Direction.UP:
        leftEyeY -= this.cellSize * 0.05;
        rightEyeY -= this.cellSize * 0.05;
        break;
      case Direction.DOWN:
        leftEyeY += this.cellSize * 0.05;
        rightEyeY += this.cellSize * 0.05;
        break;
      case Direction.LEFT:
        leftEyeX -= this.cellSize * 0.05;
        rightEyeX -= this.cellSize * 0.05;
        break;
      case Direction.RIGHT:
        leftEyeX += this.cellSize * 0.05;
        rightEyeX += this.cellSize * 0.05;
        break;
    }

    // Draw eyes with configured colors
    this.leftEye.fillStyle(this.colorConfig.eyeWhite, 1);
    this.leftEye.fillCircle(leftEyeX, leftEyeY, eyeSize * 1.5);
    this.leftEye.fillStyle(this.colorConfig.eyePupil, 1);
    this.leftEye.fillCircle(leftEyeX, leftEyeY, eyeSize);

    this.rightEye.fillStyle(this.colorConfig.eyeWhite, 1);
    this.rightEye.fillCircle(rightEyeX, rightEyeY, eyeSize * 1.5);
    this.rightEye.fillStyle(this.colorConfig.eyePupil, 1);
    this.rightEye.fillCircle(rightEyeX, rightEyeY, eyeSize);
  }

  /**
   * Draw the character mouth (happy smile)
   */
  private drawMouth(): void {
    this.mouth.clear();

    const mouthY = this.cellSize * 0.1;
    const mouthWidth = this.cellSize * 0.2;

    // Draw a happy smile with configured color
    this.mouth.lineStyle(2, this.colorConfig.mouth, 1);
    this.mouth.beginPath();
    this.mouth.arc(0, mouthY, mouthWidth, 0, Math.PI, false);
    this.mouth.strokePath();
  }

  /**
   * Set the direction the character is facing
   */
  setDirection(direction: Direction): void {
    this.direction = direction;
    this.drawEyes(); // Eyes look in the direction of movement
  }

  /**
   * Play walk animation (bouncy scale effect)
   */
  playWalkAnimation(): void {
    // Stop any existing walk animation
    if (this.walkTween) {
      this.walkTween.stop();
      this.walkTween = undefined;
    }

    // Create bouncy walk animation
    this.walkTween = this.scene.tweens.add({
      targets: this.container,
      scaleX: { from: 1, to: 1.15, duration: 75 },
      scaleY: { from: 1, to: 1.15, duration: 75 },
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.walkTween = undefined;
        this.container.setScale(1);
      },
    });
  }

  /**
   * Play bounce animation when hitting a wall
   */
  playBounceAnimation(direction: Direction, baseX: number, baseY: number): void {
    // Stop any existing bounce animation
    if (this.bounceTween) {
      this.bounceTween.stop();
      this.bounceTween = undefined;
    }

    // Calculate bounce offset based on direction
    let offsetX = 0;
    let offsetY = 0;
    const bounceAmount = 5;

    switch (direction) {
      case Direction.UP:
        offsetY = bounceAmount; // Bounce down when trying to go up
        break;
      case Direction.DOWN:
        offsetY = -bounceAmount; // Bounce up when trying to go down
        break;
      case Direction.LEFT:
        offsetX = bounceAmount; // Bounce right when trying to go left
        break;
      case Direction.RIGHT:
        offsetX = -bounceAmount; // Bounce left when trying to go right
        break;
    }

    // Animate the bounce from the true base position
    this.bounceTween = this.scene.tweens.add({
      targets: this.container,
      x: baseX + offsetX,
      y: baseY + offsetY,
      duration: 100,
      yoyo: true, // Return to base position
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Ensure we're exactly at base position after bounce
        this.container.setPosition(baseX, baseY);
        this.bounceTween = undefined;
      },
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.walkTween) {
      this.walkTween.stop();
    }
    if (this.bounceTween) {
      this.bounceTween.stop();
    }
    this.container.destroy();
  }
}
