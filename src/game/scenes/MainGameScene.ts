import Phaser from 'phaser';
import { FixedMazeProvider } from '../providers/FixedMazeProvider';
import { Maze } from '../entities/Maze';
import { Character, Direction } from '../entities/Character';
import { BlobCharacter, BlobColorConfig } from '../entities/characters/BlobCharacter';
import { PinkBlobConfig } from '../entities/characters/BlobColorPresets';
import { RainbowUnicornConfig } from '../entities/characters/UnicornColorPresets';
import { UnicornCharacter, UnicornColorConfig } from '../entities/characters/UnicornCharacter';
import { ICharacterRenderer } from '../entities/ICharacterRenderer';

type CharacterType = 'blob' | 'unicorn';

/**
 * Main Game Scene
 * The primary gameplay scene with maze, character, and UI
 */
export class MainGameScene extends Phaser.Scene {
  private maze!: Maze;
  private character!: Character;
  private mazeProvider!: FixedMazeProvider;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private timerText!: Phaser.GameObjects.Text;
  private startTime!: number;
  private gameWon: boolean = false;
  private visitedCells: Set<string> = new Set();
  private miniMapGraphics!: Phaser.GameObjects.Graphics;
  private backgroundGraphics!: Phaser.GameObjects.Graphics;
  private characterType!: CharacterType;
  private characterColorConfig!: BlobColorConfig | UnicornColorConfig;

  // Sound placeholder flags
  private moveSoundEnabled: boolean = true;
  private victorySoundEnabled: boolean = true;

  constructor() {
    super({ key: 'MainGameScene' });
  }

  init(data: { characterType?: CharacterType; characterColor?: BlobColorConfig }): void {
    // Get character type and color from scene data, or use defaults
    this.characterType = data.characterType || 'blob';
    this.characterColorConfig = data.characterColor || (this.characterType === 'blob' ? PinkBlobConfig : RainbowUnicornConfig);
  }

  create(): void {
    this.gameWon = false;
    this.visitedCells.clear();

    // Create rainbow gradient background
    this.createRainbowBackground();

    // Initialize maze provider and create maze
    this.mazeProvider = new FixedMazeProvider();
    this.maze = new Maze(this, this.mazeProvider);

    // Create UI elements
    this.createUI();

    // Create mini-map (before marking cells as visited)
    this.createMiniMap();

    // Create character at start position with selected type and color
    const startPos = this.mazeProvider.getStartPosition();
    let characterRenderer: ICharacterRenderer;
    if (this.characterType === 'blob') {
      characterRenderer = new BlobCharacter(this, this.maze.getCellSize(), this.characterColorConfig as BlobColorConfig);
    } else {
      characterRenderer = new UnicornCharacter(this, this.maze.getCellSize(), this.characterColorConfig as UnicornColorConfig);
    }
    this.character = new Character(this, this.maze, characterRenderer, startPos.x, startPos.y);

    // Mark starting position as visited
    this.markCellVisited(startPos.x, startPos.y);

    // Set up input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Start timer
    this.startTime = Date.now();

    // Center camera on maze
    this.centerCamera();

    // Listen for window resize
    this.scale.on('resize', this.handleResize, this);
  }

  /**
   * Handle window resize events
   */
  private handleResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;

    // Update camera size
    this.cameras.main.setSize(width, height);

    // Redraw background to fill new size
    this.createRainbowBackground();

    // Recenter maze
    this.centerCamera();
  }

  /**
   * Create a rainbow gradient background that fills the viewport
   */
  private createRainbowBackground(): void {
    // Destroy existing background if it exists
    if (this.backgroundGraphics) {
      this.backgroundGraphics.destroy();
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.backgroundGraphics = this.add.graphics();

    // Create rainbow gradient (top to bottom)
    const colors = [
      { color: 0xff6b6b, alpha: 0.3 }, // Red
      { color: 0xffa500, alpha: 0.3 }, // Orange
      { color: 0xffff00, alpha: 0.3 }, // Yellow
      { color: 0x4ecdc4, alpha: 0.3 }, // Turquoise
      { color: 0x45b7d1, alpha: 0.3 }, // Light blue
      { color: 0x6c5ce7, alpha: 0.3 }, // Purple
    ];

    const sectionHeight = height / colors.length;

    colors.forEach((colorData, index) => {
      this.backgroundGraphics.fillStyle(colorData.color, colorData.alpha);
      this.backgroundGraphics.fillRect(0, index * sectionHeight, width, sectionHeight);
    });

    // Add overall light background
    this.backgroundGraphics.fillStyle(0xffffff, 0.5);
    this.backgroundGraphics.fillRect(0, 0, width, height);

    this.backgroundGraphics.setDepth(-1);
    this.backgroundGraphics.setScrollFactor(0); // Stay fixed during camera movement
  }

  /**
   * Create UI elements (timer, title, instructions)
   */
  private createUI(): void {
    const width = this.cameras.main.width;

    // Title
    const title = this.add.text(width / 2, 30, 'Rainbow Maze Adventure!', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);
    title.setDepth(100);
    title.setScrollFactor(0); // Stay fixed on screen

    // Timer
    this.timerText = this.add.text(width / 2, 70, 'Time: 0s', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.timerText.setOrigin(0.5);
    this.timerText.setDepth(100);
    this.timerText.setScrollFactor(0); // Stay fixed on screen

    // Instructions
    const instructions = this.add.text(width / 2, this.cameras.main.height - 30,
      'Use Arrow Keys to move | Find the green exit!', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    instructions.setOrigin(0.5);
    instructions.setDepth(100);
    instructions.setScrollFactor(0); // Stay fixed on screen
  }

  /**
   * Create mini-map showing visited areas
   */
  private createMiniMap(): void {
    const miniMapSize = 150;
    const miniMapX = this.cameras.main.width - miniMapSize - 20;
    const miniMapY = 120;

    // Background for mini-map
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(miniMapX - 5, miniMapY - 5, miniMapSize + 10, miniMapSize + 10, 5);
    bg.setDepth(99);
    bg.setScrollFactor(0); // Stay fixed on screen

    // Mini-map title
    const miniMapTitle = this.add.text(miniMapX + miniMapSize / 2, miniMapY - 20, 'Map', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    miniMapTitle.setOrigin(0.5);
    miniMapTitle.setDepth(100);
    miniMapTitle.setScrollFactor(0); // Stay fixed on screen

    // Mini-map graphics
    this.miniMapGraphics = this.add.graphics();
    this.miniMapGraphics.setDepth(100);
    this.miniMapGraphics.setScrollFactor(0); // Stay fixed on screen

    // Store mini-map position for updates
    (this.miniMapGraphics as any).miniMapX = miniMapX;
    (this.miniMapGraphics as any).miniMapY = miniMapY;
    (this.miniMapGraphics as any).miniMapSize = miniMapSize;
  }

  /**
   * Update mini-map to show visited cells
   */
  private updateMiniMap(): void {
    const miniMapX = (this.miniMapGraphics as any).miniMapX;
    const miniMapY = (this.miniMapGraphics as any).miniMapY;
    const miniMapSize = (this.miniMapGraphics as any).miniMapSize;

    this.miniMapGraphics.clear();

    const mazeData = this.mazeProvider.getMazeData();
    const cellSize = miniMapSize / mazeData.width;

    // Draw visited cells
    this.visitedCells.forEach((cellKey) => {
      const [x, y] = cellKey.split(',').map(Number);
      this.miniMapGraphics.fillStyle(0x4ecdc4, 0.6);
      this.miniMapGraphics.fillRect(
        miniMapX + x * cellSize,
        miniMapY + y * cellSize,
        cellSize,
        cellSize
      );
    });

    // Draw current position
    const currentPos = this.character.getGridPosition();
    this.miniMapGraphics.fillStyle(0xff69b4, 1);
    this.miniMapGraphics.fillCircle(
      miniMapX + currentPos.x * cellSize + cellSize / 2,
      miniMapY + currentPos.y * cellSize + cellSize / 2,
      cellSize * 0.6
    );

    // Draw exit
    const exitPos = mazeData.exitPosition;
    this.miniMapGraphics.fillStyle(0x00ff00, 1);
    this.miniMapGraphics.fillRect(
      miniMapX + exitPos.x * cellSize,
      miniMapY + exitPos.y * cellSize,
      cellSize,
      cellSize
    );
  }

  /**
   * Mark a cell as visited for mini-map tracking
   */
  private markCellVisited(x: number, y: number): void {
    const key = `${x},${y}`;
    if (!this.visitedCells.has(key)) {
      this.visitedCells.add(key);
    }
    this.updateMiniMap();
  }

  /**
   * Center the camera on the maze
   */
  private centerCamera(): void {
    const mazeData = this.mazeProvider.getMazeData();
    const cellSize = this.maze.getCellSize();
    const mazeWidth = mazeData.width * cellSize;
    const mazeHeight = mazeData.height * cellSize;

    const cameraX = (this.cameras.main.width - mazeWidth) / 2;
    const cameraY = (this.cameras.main.height - mazeHeight) / 2 + 40; // Offset for title

    this.cameras.main.setScroll(-cameraX, -cameraY);
  }

  /**
   * Handle input and update game state
   */
  update(): void {
    if (this.gameWon || this.character.getIsMoving()) {
      return;
    }

    // Handle arrow key input
    if (this.cursors.up.isDown) {
      if (this.character.move(Direction.UP, () => this.onMoveComplete())) {
        this.playMoveSound();
      }
    } else if (this.cursors.down.isDown) {
      if (this.character.move(Direction.DOWN, () => this.onMoveComplete())) {
        this.playMoveSound();
      }
    } else if (this.cursors.left.isDown) {
      if (this.character.move(Direction.LEFT, () => this.onMoveComplete())) {
        this.playMoveSound();
      }
    } else if (this.cursors.right.isDown) {
      if (this.character.move(Direction.RIGHT, () => this.onMoveComplete())) {
        this.playMoveSound();
      }
    }

    // Update timer
    if (!this.gameWon) {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.timerText.setText(`Time: ${elapsedSeconds}s`);
    }
  }

  /**
   * Called when character completes a move
   */
  private onMoveComplete(): void {
    const currentPos = this.character.getGridPosition();
    const exitPos = this.mazeProvider.getExitPosition();

    // Mark cell as visited
    this.markCellVisited(currentPos.x, currentPos.y);

    // Check for victory
    if (currentPos.x === exitPos.x && currentPos.y === exitPos.y) {
      this.handleVictory();
    }
  }

  /**
   * Handle victory condition
   */
  private handleVictory(): void {
    this.gameWon = true;

    const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    // Play victory sound
    this.playVictorySound();

    // Create victory screen
    this.createVictoryScreen(elapsedSeconds);
  }

  /**
   * Create victory screen with celebration
   */
  private createVictoryScreen(elapsedSeconds: number): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(200);
    overlay.setScrollFactor(0);

    // Victory text
    const victoryText = this.add.text(width / 2, height / 2 - 50, 'YOU WIN!', {
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(201);
    victoryText.setScrollFactor(0);

    // Time text
    const timeText = this.add.text(
      width / 2,
      height / 2 + 20,
      `Time: ${elapsedSeconds} seconds`,
      {
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }
    );
    timeText.setOrigin(0.5);
    timeText.setDepth(201);
    timeText.setScrollFactor(0);

    // Restart instruction
    const restartText = this.add.text(
      width / 2,
      height / 2 + 80,
      'Press SPACE to play again!',
      {
        fontSize: '24px',
        color: '#4ecdc4',
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    restartText.setOrigin(0.5);
    restartText.setDepth(201);
    restartText.setScrollFactor(0);

    // Pulsating animation for victory text
    this.tweens.add({
      targets: victoryText,
      scale: { from: 1, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Create celebration particles
    this.createCelebrationParticles();

    // Add restart functionality
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  /**
   * Create celebration particle effects
   */
  private createCelebrationParticles(): void {
    const width = this.cameras.main.width;

    const colors = [0xff6b6b, 0xffa500, 0xffff00, 0x4ecdc4, 0x45b7d1, 0x6c5ce7, 0xff85c0];

    // Create multiple particle emitters for rainbow effect
    colors.forEach((color) => {
      const particles = this.add.particles(0, 0, 'particle', {
        x: { min: 0, max: width },
        y: -20,
        speed: { min: 100, max: 200 },
        angle: { min: 60, max: 120 },
        scale: { start: 1, end: 0 },
        lifespan: 2000,
        frequency: 100,
        tint: color,
        blendMode: 'ADD',
      });
      particles.setDepth(202);
      particles.setScrollFactor(0);

      // Stop emitting after 10 seconds
      this.time.delayedCall(10000, () => {
        particles.stop();
      });
    });
  }

  /**
   * Play movement sound (placeholder)
   */
  private playMoveSound(): void {
    if (!this.moveSoundEnabled) return;

    // Placeholder: In a real implementation, you would load and play actual sound files
    // For now, we'll just log or use a simple beep if available
    console.log('🔊 Move sound');
  }

  /**
   * Play victory sound (placeholder)
   */
  private playVictorySound(): void {
    if (!this.victorySoundEnabled) return;

    // Placeholder: In a real implementation, you would load and play actual sound files
    console.log('🎉 Victory sound!');
  }

  /**
   * Preload assets (called before create)
   */
  preload(): void {
    // Create a simple particle texture for celebrations
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();

    // In a real implementation, you would load sound files here:
    // this.load.audio('moveSound', 'assets/sounds/move.mp3');
    // this.load.audio('victorySound', 'assets/sounds/victory.mp3');
  }
}
