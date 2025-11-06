import Phaser from 'phaser';
import { FixedMazeProvider } from '../providers/FixedMazeProvider';
import { Maze } from '../entities/Maze';
import { Character, Direction } from '../entities/Character';
import { BlobCharacter, BlobColorConfig } from '../entities/characters/BlobCharacter';
import { PinkBlobConfig } from '../entities/characters/BlobColorPresets';
import { RainbowUnicornConfig } from '../entities/characters/UnicornColorPresets';
import { UnicornCharacter, UnicornColorConfig } from '../entities/characters/UnicornCharacter';
import { ICharacterRenderer } from '../entities/ICharacterRenderer';
import { RandomMazeProvider } from '../providers/RandomMazeProvider';
import { IMazeProvider } from '../providers/IMazeProvider';
import { createRainbowText } from '../utils/TextUtils';

type CharacterType = 'blob' | 'unicorn';

/**
 * Main Game Scene
 * The primary gameplay scene with maze, character, and UI
 */
export class MainGameScene extends Phaser.Scene {
  private maze!: Maze;
  private character!: Character;
  private mazeProvider!: IMazeProvider;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private titleText!: Phaser.GameObjects.Container;
  private instructionsText!: Phaser.GameObjects.Text;
  private startTime!: number;
  private gameWon: boolean = false;
  private visitedCells: Set<string> = new Set();
  private miniMapGraphics!: Phaser.GameObjects.Graphics;
  private miniMapBackground!: Phaser.GameObjects.Graphics;
  private miniMapTitle!: Phaser.GameObjects.Text;
  private backgroundGraphics!: Phaser.GameObjects.Graphics;
  private characterType!: CharacterType;
  private characterColorConfig!: BlobColorConfig | UnicornColorConfig;
  private baseTopUiSpace: number = 100;
  private baseBottomUiSpace: number = 60;
  private exitEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private themeMusic?: Phaser.Sound.BaseSound;

  // Sound placeholder flags
  private moveSoundEnabled: boolean = true;
  private victorySoundEnabled: boolean = true;

  // Double-tap state
  private lastKeyPressed: Direction | null = null;
  private lastKeyPressTime: number = 0;
  private doubleTapThreshold: number = 300; // milliseconds
  private autoMoveDirection: Direction | null = null;

  // Difficulty slider
  private difficulty: number = 1; // 0=Easy, 1=Medium, 2=Hard, 3=Expert

  constructor() {
    super({ key: 'MainGameScene' });
  }

  init(data: { characterType?: CharacterType; characterColor?: BlobColorConfig; difficulty?: number }): void {
    // Get character type and color from scene data, or use defaults
    this.characterType = data.characterType || 'blob';
    this.characterColorConfig = data.characterColor || (this.characterType === 'blob' ? PinkBlobConfig : RainbowUnicornConfig);
    this.difficulty = data.difficulty !== undefined ? data.difficulty : 1;
  }

  create(): void {
    this.gameWon = false;
    this.visitedCells.clear();

    // Start theme music on loop (only if not already playing)
    const existingMusic = this.sound.get('themeMusic');
    if (!existingMusic || !existingMusic.isPlaying) {
      this.themeMusic = this.sound.add('themeMusic', { loop: true, volume: 0.5 });
      this.themeMusic.play();
    } else {
      this.themeMusic = existingMusic;
    }

    // Create rainbow gradient background
    this.createRainbowBackground();

    // Initialize maze provider and create maze
    const mazeSize = this.getMazeSizeFromDifficulty();
    this.mazeProvider = new RandomMazeProvider(mazeSize, mazeSize);
    // Compute a cell size that fits the current viewport
    const initialCellSize = this.getBestCellSize(this.cameras.main.width, this.cameras.main.height);
    this.maze = new Maze(this, this.mazeProvider, { cellSize: initialCellSize });

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

    // Create a sparkling effect on the exit
    this.createExitSparkle();

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

    // If the optimal cell size changed, live-update maze and character without restarting
    const targetCell = this.getBestCellSize(width, height);
    if (targetCell !== this.maze.getCellSize()) {
      this.maze.setCellSize(targetCell);
      this.character.resizeForCellSize(targetCell);
      this.character.refreshPosition();
    }

    // Redraw background to fill new size
    this.createRainbowBackground();

    // Reposition UI elements
    if (this.titleText) {
      this.titleText.setPosition(width / 2, 30);
    }
    if (this.instructionsText) {
      this.instructionsText.setPosition(width / 2, height - 30);
    }

    // Update mini-map placement
    if (this.miniMapGraphics) {
      const miniMapSize = 150;
      const miniMapX = width - miniMapSize - 20;
      const miniMapY = 120;

      // Update minimap background position
      if (this.miniMapBackground) {
        this.miniMapBackground.clear();
        this.miniMapBackground.fillStyle(0x000000, 0.5);
        this.miniMapBackground.fillRoundedRect(miniMapX - 5, miniMapY - 5, miniMapSize + 10, miniMapSize + 10, 5);
      }

      // Update minimap title position
      if (this.miniMapTitle) {
        this.miniMapTitle.setPosition(miniMapX + miniMapSize / 2, miniMapY - 20);
      }

      (this.miniMapGraphics as any).miniMapX = miniMapX;
      (this.miniMapGraphics as any).miniMapY = miniMapY;
      (this.miniMapGraphics as any).miniMapSize = miniMapSize;
      this.updateMiniMap();
    }

    // Recenter maze
    this.centerCamera();

    // Reposition exit sparkle to the new pixel location
    this.updateExitSparklePosition();
  }

  /**
   * Determine the best cell size to fit the maze into the current viewport.
   */
  private getBestCellSize(viewW: number, viewH: number): number {
    const mazeData = this.mazeProvider.getMazeData();
    const uiTop = this.baseTopUiSpace;
    const uiBottom = this.baseBottomUiSpace;
    const availableW = Math.max(1, Math.floor(viewW - 40)); // small side padding
    const availableH = Math.max(1, Math.floor(viewH - (uiTop + uiBottom)));
    const fitCell = Math.min(
      Math.floor(availableW / mazeData.width),
      Math.floor(availableH / mazeData.height)
    );
    return Math.max(20, fitCell); // enforce a minimum size for clarity
  }

  /**
   * Get maze size based on difficulty level
   */
  private getMazeSizeFromDifficulty(): number {
    const sizes = [10, 14, 18, 22]; // Easy, Medium, Hard, Expert
    return sizes[this.difficulty] || 14;
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
   * Create a very sparkly particle emitter at the maze exit.
   */
  private createExitSparkle(): void {
    // Ensure particle texture exists (preload creates it)
    if (!this.textures.exists('particle')) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff);
      g.fillCircle(4, 4, 4);
      g.generateTexture('particle', 8, 8);
      g.destroy();
    }

    const exitPos = this.mazeProvider.getExitPosition();
    const px = this.maze.gridToPixel(exitPos.x, exitPos.y);

    // If already exists (e.g., after scene resume), destroy and recreate for clean config
    if (this.exitEmitter) {
      this.exitEmitter.destroy();
      this.exitEmitter = undefined;
    }

    // A dense, bright sparkle with additive blending
    this.exitEmitter = this.add.particles(px.x, px.y, 'particle', {
      speed: { min: 20, max: 90 },
      angle: { min: 0, max: 360 },
      lifespan: { min: 600, max: 1200 },
      quantity: 6,
      frequency: 40,
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0x00ff88, 0x00ff00, 0xffffff],
      gravityY: 0,
      blendMode: 'ADD',
    });
    this.exitEmitter.setDepth(9); // Above maze tiles, below character
  }

  /**
   * Update the exit sparkle position after resize/cell-size changes.
   */
  private updateExitSparklePosition(): void {
    if (!this.exitEmitter) return;
    const exitPos = this.mazeProvider.getExitPosition();
    const px = this.maze.gridToPixel(exitPos.x, exitPos.y);
    this.exitEmitter.setPosition(px.x, px.y);
  }

  /**
   * Create UI elements (timer, title, instructions)
   */
  private createUI(): void {
    const width = this.cameras.main.width;

    // Title with rainbow gradient
    this.titleText = createRainbowText(this, width / 2, 30, 'Madzia\'s Rainbow Maze Adventure!', {
      fontSize: '32px',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.titleText.setDepth(100);
    this.titleText.setScrollFactor(0);

    // Instructions
    this.instructionsText = this.add.text(width / 2, this.cameras.main.height - 30,
      'Use Arrow Keys to move | Find the green exit!', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.instructionsText.setOrigin(0.5);
    this.instructionsText.setDepth(100);
    this.instructionsText.setScrollFactor(0); // Stay fixed on screen
  }

  /**
   * Create mini-map showing visited areas
   */
  private createMiniMap(): void {
    const miniMapSize = 150;
    const miniMapX = this.cameras.main.width - miniMapSize - 20;
    const miniMapY = 120;

    // Background for mini-map
    this.miniMapBackground = this.add.graphics();
    this.miniMapBackground.fillStyle(0x000000, 0.5);
    this.miniMapBackground.fillRoundedRect(miniMapX - 5, miniMapY - 5, miniMapSize + 10, miniMapSize + 10, 5);
    this.miniMapBackground.setDepth(99);
    this.miniMapBackground.setScrollFactor(0); // Stay fixed on screen

    // Mini-map title
    this.miniMapTitle = this.add.text(miniMapX + miniMapSize / 2, miniMapY - 20, 'Map', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.miniMapTitle.setOrigin(0.5);
    this.miniMapTitle.setDepth(100);
    this.miniMapTitle.setScrollFactor(0); // Stay fixed on screen

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
    if (this.gameWon) {
      return;
    }

    // Handle auto-move mode (double-tap continuous movement)
    if (this.autoMoveDirection !== null && !this.character.getIsMoving()) {
      // Use 75ms duration (2x speed of normal 150ms)
      const moved = this.character.move(this.autoMoveDirection, () => this.onAutoMoveComplete(), 75);
      if (moved) {
        this.playMoveSound();
      } else {
        // Hit a wall, stop auto-move
        this.autoMoveDirection = null;
        this.character.getRenderer().setSparkleIntensity(1);
      }
      return;
    }

    // Don't process new input while character is moving or in auto-move
    if (this.character.getIsMoving()) {
      return;
    }

    // Detect key presses for double-tap
    const currentTime = Date.now();
    let pressedDirection: Direction | null = null;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      pressedDirection = Direction.UP;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      pressedDirection = Direction.DOWN;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
      pressedDirection = Direction.LEFT;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
      pressedDirection = Direction.RIGHT;
    }

    // Process key press
    if (pressedDirection !== null) {
      // Cancel auto-move if any key is pressed
      if (this.autoMoveDirection !== null) {
        this.autoMoveDirection = null;
        this.character.getRenderer().setSparkleIntensity(1);
        this.lastKeyPressed = null;
        return;
      }

      // Check for double-tap
      const isDoubleTap =
        pressedDirection === this.lastKeyPressed &&
        (currentTime - this.lastKeyPressTime) < this.doubleTapThreshold;

      if (isDoubleTap) {
        // Enter auto-move mode
        this.autoMoveDirection = pressedDirection;
        this.character.getRenderer().setSparkleIntensity(100);
        this.lastKeyPressed = null; // Reset to prevent triple-tap
      } else {
        // Single press - move once
        if (this.character.move(pressedDirection, () => this.onMoveComplete())) {
          this.playMoveSound();
        }
        this.lastKeyPressed = pressedDirection;
        this.lastKeyPressTime = currentTime;
      }
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
   * Called when character completes a move in auto-move mode
   */
  private onAutoMoveComplete(): void {
    const currentPos = this.character.getGridPosition();
    const exitPos = this.mazeProvider.getExitPosition();

    // Mark cell as visited
    this.markCellVisited(currentPos.x, currentPos.y);

    // Check for victory
    if (currentPos.x === exitPos.x && currentPos.y === exitPos.y) {
      this.autoMoveDirection = null; // Stop auto-move
      this.character.getRenderer().setSparkleIntensity(1);
      this.handleVictory();
    }
    // Auto-move will continue in the next update cycle if not at exit
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

    // Add restart functionality (generate a fresh random maze and keep character selection and difficulty)
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.restart({
        characterType: this.characterType,
        characterColor: this.characterColorConfig,
        difficulty: this.difficulty,
      });
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
   * Play movement sound
   */
  private playMoveSound(): void {
    if (!this.moveSoundEnabled) return;

    // Play move sound effect
    this.sound.play('moveSound', { volume: 0.1 });
  }

  /**
   * Play victory sound
   */
  private playVictorySound(): void {
    if (!this.victorySoundEnabled) return;

    // Play winner sound effect once
    this.sound.play('winnerSound', { volume: 0.7 });
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

    // Load theme music
    this.load.audio('themeMusic', 'assets/sounds/theme.mp3');

    // Load winner sound effect
    this.load.audio('winnerSound', 'assets/sounds/winner.mp3');

    // Load move sound effect
    this.load.audio('moveSound', 'assets/sounds/move.mp3');
  }

  /**
   * Clean up when scene shuts down
   */
  shutdown(): void {
    // Stop and clean up theme music only if it exists and hasn't been destroyed
    if (this.themeMusic && this.themeMusic.key) {
      this.themeMusic.stop();
      this.themeMusic.destroy();
      this.themeMusic = undefined;
    }

    // Remove resize listener
    this.scale.off('resize', this.handleResize, this);
  }
}
