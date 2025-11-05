import Phaser from 'phaser';
import { ICharacterRenderer } from '../ICharacterRenderer';
import { Direction } from '../MovementController';

/**
 * Color configuration for UnicornCharacter
 */
export interface UnicornColorConfig {
  bodyPrimary: number;     // Main white/body color
  bodySecondary: number;   // Subtle tint overlay
  bodyHighlight: number;   // Small highlight
  horn: number;            // Horn color
  hornGlow: number;        // Horn magical glow tint
  manePrimary: number;     // Mane main color
  maneSecondary: number;   // Mane highlight color
  eyeWhite: number;        // Eye white
  eyePupil: number;        // Eye pupil
  mouth: number;           // Smile color
}

/**
 * Unicorn Character Renderer (sprite-based)
 * Draws a cute unicorn into a dynamic texture and uses a Sprite for rendering.
 * Adds a particle emitter to make the horn sparkle.
 */
export class UnicornCharacter implements ICharacterRenderer {
  readonly container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private cellSize: number;
  private color: UnicornColorConfig;
  private sprite!: Phaser.GameObjects.Sprite;
  private textureKey: string;
  private direction: Direction = Direction.RIGHT;
  private walkTween?: Phaser.Tweens.Tween;
  private bounceTween?: Phaser.Tweens.Tween;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Relative horn position within the sprite texture (set during draw)
  private hornOffsetX: number = 0;
  private hornOffsetY: number = 0;

  constructor(scene: Phaser.Scene, cellSize: number, color: UnicornColorConfig) {
    this.scene = scene;
    this.cellSize = cellSize;
    this.color = color;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(10);

    // Create a unique texture key for this instance
    this.textureKey = `unicorn_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    this.createTexture();

    // Create sprite from generated texture (anchor centered)
    this.sprite = scene.add.sprite(0, 0, this.textureKey);
    this.sprite.setOrigin(0.5, 0.5);
    this.container.add(this.sprite);

    // Setup horn sparkle particles using the preloaded 'particle' texture
    this.setupHornSparkle();
  }

  /**
   * Draw the unicorn into a dynamic texture and remember the horn position.
   */
  private createTexture(): void {
    const g = this.scene.add.graphics();
    g.clear();

    // Head size to roughly match BlobCharacter
    const headR = this.cellSize * 0.35;

    // Texture size with a bit of margin for the horn
    const texW = Math.ceil(headR * 2 + this.cellSize * 0.3);
    const texH = Math.ceil(headR * 2 + headR * 1.1 + this.cellSize * 0.2);
    const cx = texW / 2;
    const cy = texH / 2;

    // Draw head
    g.fillStyle(this.color.bodyPrimary, 1);
    g.fillCircle(cx, cy, headR);

    // Draw horn (triangle)
    const hornHeight = headR * 0.8;
    const hornWidth = headR * 0.35;
    const hornBaseX = cx;
    const hornBaseY = cy - headR * 0.8;
    const hornTipX = hornBaseX;
    const hornTipY = hornBaseY - hornHeight;
    g.fillStyle(this.color.horn, 1);
    g.beginPath();
    g.moveTo(hornBaseX - hornWidth / 2, hornBaseY);
    g.lineTo(hornBaseX + hornWidth / 2, hornBaseY);
    g.lineTo(hornTipX, hornTipY);
    g.closePath();
    g.fillPath();

    // Horn glow
    g.fillStyle(this.color.hornGlow, 0.25);
    g.fillCircle(hornTipX, hornTipY + hornHeight * 0.2, hornHeight * 0.35);

    // Eyes: smaller filled circles
    const headX = cx;
    const headY = cy;
    const eyeY = headY - headR * 0.05;
    const eyeRadius = headR * 0.08;
    const leftEyeX = headX - headR * 0.15;
    const rightEyeX = headX + headR * 0.15;
    g.fillStyle(this.color.eyePupil, 1);
    g.fillCircle(leftEyeX, eyeY, eyeRadius);
    g.fillCircle(rightEyeX, eyeY, eyeRadius);

    // Twinkle highlights (small white dots at top-right of each eye)
    const twinkleR = eyeRadius * 0.35;
    const twinkleOffset = eyeRadius * 0.3;
    g.fillStyle(this.color.eyeWhite, 1);
    g.fillCircle(leftEyeX + twinkleOffset, eyeY - twinkleOffset, twinkleR);
    g.fillCircle(rightEyeX + twinkleOffset, eyeY - twinkleOffset, twinkleR);

    // Friendly smile
    g.lineStyle(Math.max(2, Math.floor(this.cellSize * 0.05)), this.color.mouth, 1);
    g.beginPath();
    g.arc(headX + headR * 0.1, headY + headR * 0.25, headR * 0.35, 0, Math.PI, false);
    g.strokePath();

    // Compute horn offset relative to texture center -> used for particle follow
    this.hornOffsetX = hornTipX - cx;
    this.hornOffsetY = hornTipY - cy;

    // Generate a texture and clean up graphics
    g.generateTexture(this.textureKey, texW, texH);
    g.destroy();
  }

  /**
   * Configure a small particle emitter that follows the horn tip.
   */
  private setupHornSparkle(): void {
    // Use existing 'particle' texture from scene preload; if missing, make a tiny one
    const hasParticle = this.scene.textures.exists('particle');
    if (!hasParticle) {
      const g = this.scene.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillCircle(2, 2, 2);
      g.generateTexture('particle', 4, 4);
      g.destroy();
    }

    // Create a ParticleEmitterManager with inline emitter config (no createEmitter)
    this.particles = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 10, max: 30 },
      lifespan: { min: 400, max: 800 },
      alpha: { start: 1, end: 0 },
      scale: { start: 0.5, end: 0 },
      gravityY: 0,
      angle: { min: -40, max: 40 },
      frequency: 60,
      blendMode: 'ADD',
      tint: [this.color.hornGlow, 0xffffff, this.color.maneSecondary],
      // Follow the unicorn container with an offset to the horn tip
      follow: this.container,
      followOffset: { x: this.hornOffsetX, y: this.hornOffsetY },
    });
    this.particles.setDepth(20);
  }

  setDirection(direction: Direction): void {
    this.direction = direction;
    // Flip or tilt the sprite to suggest direction
    switch (direction) {
      case Direction.LEFT:
        this.sprite.setFlipX(true);
        this.sprite.setAngle(-2);
        break;
      case Direction.RIGHT:
        this.sprite.setFlipX(false);
        this.sprite.setAngle(2);
        break;
      case Direction.UP:
        this.sprite.setAngle(-6);
        break;
      case Direction.DOWN:
        this.sprite.setAngle(6);
        break;
    }
  }

  playWalkAnimation(): void {
    if (this.walkTween) {
      this.walkTween.stop();
      this.walkTween = undefined;
    }
    // Gentle bob + tiny wag (rotation)
    this.walkTween = this.scene.tweens.add({
      targets: this.container,
      y: `-=${Math.max(2, Math.floor(this.cellSize * 0.05))}`,
      angle: { from: this.container.angle, to: this.container.angle + (this.direction === Direction.LEFT ? -2 : 2) },
      duration: 90,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.walkTween = undefined;
        // Reset any drift
        this.container.setAngle(0);
      },
    });
  }

  playBounceAnimation(direction: Direction, baseX: number, baseY: number): void {
    if (this.bounceTween) {
      this.bounceTween.stop();
      this.bounceTween = undefined;
    }

    const amount = Math.max(3, Math.floor(this.cellSize * 0.1));
    let dx = 0;
    let dy = 0;
    switch (direction) {
      case Direction.UP:
        dy = amount;
        break;
      case Direction.DOWN:
        dy = -amount;
        break;
      case Direction.LEFT:
        dx = amount;
        break;
      case Direction.RIGHT:
        dx = -amount;
        break;
    }

    this.bounceTween = this.scene.tweens.add({
      targets: this.container,
      x: baseX + dx,
      y: baseY + dy,
      duration: 120,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.container.setPosition(baseX, baseY);
        this.bounceTween = undefined;
      },
    });
  }

  destroy(): void {
    if (this.walkTween) this.walkTween.stop();
    if (this.bounceTween) this.bounceTween.stop();
    if (this.particles) {
      this.particles.destroy();
    }
    if (this.sprite) this.sprite.destroy();
    if (this.textureKey && this.scene.textures.exists(this.textureKey)) {
      this.scene.textures.remove(this.textureKey);
    }
    this.container.destroy();
  }
}
