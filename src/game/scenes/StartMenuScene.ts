import Phaser from 'phaser';
import { BlobCharacter, BlobColorConfig } from '../entities/characters/BlobCharacter';
import { UnicornCharacter, UnicornColorConfig } from '../entities/characters/UnicornCharacter';
import { ALL_BLOB_PRESETS } from '../entities/characters/BlobColorPresets';
import { ALL_UNICORN_PRESETS } from '../entities/characters/UnicornColorPresets';
import { createRainbowText } from '../utils/TextUtils';

type CharacterType = 'blob' | 'unicorn';

/**
 * Start Menu Scene
 * Character selection and game start screen
 */
export class StartMenuScene extends Phaser.Scene {
  private selectedCharacterType: CharacterType | null = null;
  private selectedColorIndex: number = 0;
  private characterTypeContainers: Phaser.GameObjects.Container[] = [];
  private characterTypeBoxes: Phaser.GameObjects.Graphics[] = [];
  private colorPreviewContainers: Phaser.GameObjects.Container[] = [];
  private colorPreviewBoxes: Phaser.GameObjects.Graphics[] = [];
  private characterTypePreviews: (BlobCharacter | UnicornCharacter)[] = [];
  private colorPreviews: (BlobCharacter | UnicornCharacter)[] = [];
  private startButton!: Phaser.GameObjects.Container;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private colorRowContainer!: Phaser.GameObjects.Container;
  private difficulty: number = 1; // 0=Easy, 1=Medium, 2=Hard, 3=Expert
  private sliderHandle?: Phaser.GameObjects.Graphics;
  private sliderTrack?: Phaser.GameObjects.Graphics;
  private difficultyText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'StartMenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create rainbow gradient background
    this.createRainbowBackground();

    // Title with rainbow gradient
    const title = createRainbowText(this, width / 2, height * 0.2, 'Madzia\'s Rainbow Maze Adventure!', {
      fontSize: '48px',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });
    title.setDepth(100);

    // Subtitle
    const subtitle = this.add.text(width / 2, height * 0.28, 'Choose Your Character', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    subtitle.setOrigin(0.5);
    subtitle.setDepth(100);

    // Create difficulty slider
    this.createDifficultySlider();

    // Create character type selection (first row)
    this.createCharacterTypeSelection();

    // Create color selection container (second row - initially hidden)
    this.colorRowContainer = this.add.container(0, 0);
    this.colorRowContainer.setVisible(false);

    // Create start button (initially hidden)
    this.createStartButton();
    this.startButton.setVisible(false);

    // Set up input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard!.on('keydown-SPACE', () => this.startGame());

    // Listen for window resize
    this.scale.on('resize', this.handleResize, this);
  }

  /**
   * Create rainbow gradient background
   */
  private createRainbowBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const graphics = this.add.graphics();

    const colors = [
      { color: 0xff6b6b, alpha: 0.3 },
      { color: 0xffa500, alpha: 0.3 },
      { color: 0xffff00, alpha: 0.3 },
      { color: 0x4ecdc4, alpha: 0.3 },
      { color: 0x45b7d1, alpha: 0.3 },
      { color: 0x6c5ce7, alpha: 0.3 },
    ];

    const sectionHeight = height / colors.length;

    colors.forEach((colorData, index) => {
      graphics.fillStyle(colorData.color, colorData.alpha);
      graphics.fillRect(0, index * sectionHeight, width, sectionHeight);
    });

    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillRect(0, 0, width, height);

    graphics.setDepth(-1);
  }

  /**
   * Get maze size based on difficulty level
   */
  private getDifficultyName(): string {
    const names = ['Easy', 'Medium', 'Hard', 'Expert'];
    return names[this.difficulty] || 'Medium';
  }

  /**
   * Create difficulty slider
   */
  private createDifficultySlider(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const sliderY = height * 0.85;
    const sliderWidth = 300;
    const sliderX = width / 2 - sliderWidth / 2;

    // Slider label
    const sliderLabel = this.add.text(width / 2, sliderY - 40, 'Difficulty', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    sliderLabel.setOrigin(0.5);
    sliderLabel.setDepth(100);

    // Slider track
    this.sliderTrack = this.add.graphics();
    this.sliderTrack.lineStyle(4, 0xffffff, 1);
    this.sliderTrack.strokeRect(sliderX, sliderY - 2, sliderWidth, 4);
    this.sliderTrack.setDepth(100);

    // Difficulty labels (clickable)
    const labels = ['Easy', 'Medium', 'Hard', 'Expert'];
    const labelSpacing = sliderWidth / 3;
    labels.forEach((label, index) => {
      const labelX = sliderX + index * labelSpacing;
      const labelText = this.add.text(labelX, sliderY + 18, label, {
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      });
      labelText.setOrigin(0.5);
      labelText.setDepth(100);
      labelText.setInteractive({ useHandCursor: true });

      // Click label to set difficulty
      labelText.on('pointerdown', () => {
        this.difficulty = index;
        const snapX = sliderX + (this.difficulty * labelSpacing);
        this.sliderHandle!.setPosition(snapX, sliderY);
        this.updateDifficultyDisplay();
      });

      // Hover effect
      labelText.on('pointerover', () => {
        labelText.setScale(1.1);
      });
      labelText.on('pointerout', () => {
        labelText.setScale(1);
      });
    });

    // Slider handle
    const handleRadius = 12;
    this.sliderHandle = this.add.graphics();
    this.sliderHandle.fillStyle(0x4ecdc4, 1);
    this.sliderHandle.fillCircle(0, 0, handleRadius);
    this.sliderHandle.lineStyle(3, 0xffffff, 1);
    this.sliderHandle.strokeCircle(0, 0, handleRadius);
    this.sliderHandle.setDepth(101);

    // Position handle based on current difficulty
    const handleX = sliderX + (this.difficulty * labelSpacing);
    this.sliderHandle.setPosition(handleX, sliderY);

    // Difficulty text
    this.difficultyText = this.add.text(width / 2, sliderY - 15, this.getDifficultyName(), {
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.difficultyText.setOrigin(0.5);
    this.difficultyText.setDepth(100);

    // Make handle interactive
    this.sliderHandle.setInteractive(
      new Phaser.Geom.Circle(0, 0, handleRadius),
      Phaser.Geom.Circle.Contains
    );

    // Store slider info on the handle for event handlers
    (this.sliderHandle as any).sliderX = sliderX;
    (this.sliderHandle as any).sliderY = sliderY;
    (this.sliderHandle as any).sliderWidth = sliderWidth;
    (this.sliderHandle as any).labelSpacing = labelSpacing;

    // Drag events
    this.input.setDraggable(this.sliderHandle);

    this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Graphics, dragX: number) => {
      if (gameObject !== this.sliderHandle) return;

      const sliderInfo = gameObject as any;
      const clampedX = Phaser.Math.Clamp(dragX, sliderInfo.sliderX, sliderInfo.sliderX + sliderInfo.sliderWidth);
      gameObject.setPosition(clampedX, sliderInfo.sliderY);

      // Snap to nearest difficulty level
      const normalizedPos = (clampedX - sliderInfo.sliderX) / sliderInfo.sliderWidth;
      const newDifficulty = Math.round(normalizedPos * 3);

      if (newDifficulty !== this.difficulty) {
        this.difficulty = newDifficulty;
        this.updateDifficultyDisplay();
      }
    });

    this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Graphics) => {
      if (gameObject !== this.sliderHandle) return;

      // Snap handle to exact position
      const sliderInfo = gameObject as any;
      const snapX = sliderInfo.sliderX + (this.difficulty * sliderInfo.labelSpacing);
      gameObject.setPosition(snapX, sliderInfo.sliderY);
    });
  }

  /**
   * Update the difficulty display text
   */
  private updateDifficultyDisplay(): void {
    if (this.difficultyText) {
      this.difficultyText.setText(this.getDifficultyName());
    }
  }

  /**
   * Create character type selection UI (first row)
   */
  private createCharacterTypeSelection(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const characterSize = 100;
    const spacing = 200;
    const y = height * 0.45;

    const characterTypes: CharacterType[] = ['blob', 'unicorn'];
    const startX = width / 2 - (characterTypes.length - 1) * spacing / 2;

    characterTypes.forEach((type, index) => {
      const x = startX + index * spacing;

      // Create selection box
      const selectionBox = this.add.graphics();
      selectionBox.lineStyle(4, 0xffd700, 1);
      selectionBox.strokeRoundedRect(-characterSize / 2 - 15, -characterSize / 2 - 15,
        characterSize + 30, characterSize + 30, 10);
      selectionBox.setVisible(false);
      selectionBox.setPosition(x, y);
      this.characterTypeBoxes.push(selectionBox);

      // Create character container
      const container = this.add.container(x, y);
      container.setDepth(10);

      // Create character preview with default color
      let character: BlobCharacter | UnicornCharacter;
      if (type === 'blob') {
        character = new BlobCharacter(this, characterSize, ALL_BLOB_PRESETS[0]);
      } else {
        character = new UnicornCharacter(this, characterSize, ALL_UNICORN_PRESETS[0]);
      }
      character.container.setPosition(0, 0);

      container.add(character.container);
      this.characterTypeContainers.push(container);
      this.characterTypePreviews.push(character);

      // Add label below character
      const label = this.add.text(0, characterSize / 2 + 30,
        type.charAt(0).toUpperCase() + type.slice(1), {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      });
      label.setOrigin(0.5);
      container.add(label);

      // Make character clickable
      const hitArea = this.add.circle(0, 0, characterSize / 2 + 15);
      hitArea.setInteractive();
      hitArea.on('pointerdown', () => {
        this.selectCharacterType(type);
      });
      hitArea.on('pointerover', () => {
        container.setScale(1.1);
      });
      hitArea.on('pointerout', () => {
        container.setScale(1);
      });
      hitArea.setAlpha(0.01); // Nearly invisible but still clickable
      container.add(hitArea);
    });
  }

  /**
   * Create color selection UI (second row)
   */
  private createColorSelection(characterType: CharacterType): void {
    // Clear previous color selections
    this.colorPreviews.forEach(preview => preview.destroy());
    this.colorPreviews = [];
    this.colorPreviewContainers.forEach(container => container.destroy());
    this.colorPreviewContainers = [];
    this.colorPreviewBoxes.forEach(box => box.destroy());
    this.colorPreviewBoxes = [];
    this.colorRowContainer.removeAll(true);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const characterSize = 80;
    const spacing = 150;
    const y = height * 0.65;

    const colorPresets = characterType === 'blob' ? ALL_BLOB_PRESETS : ALL_UNICORN_PRESETS;
    const startX = width / 2 - (colorPresets.length - 1) * spacing / 2;

    colorPresets.forEach((colorConfig, index) => {
      const x = startX + index * spacing;

      // Create selection box
      const selectionBox = this.add.graphics();
      selectionBox.lineStyle(4, 0xffffff, 1);
      selectionBox.strokeRoundedRect(-characterSize / 2 - 10, -characterSize / 2 - 10,
        characterSize + 20, characterSize + 20, 10);
      selectionBox.setVisible(index === 0); // Show first one by default
      selectionBox.setPosition(x, y);
      this.colorPreviewBoxes.push(selectionBox);
      this.colorRowContainer.add(selectionBox);

      // Create character container
      const container = this.add.container(x, y);
      container.setDepth(10);

      // Create character preview
      let character: BlobCharacter | UnicornCharacter;
      if (characterType === 'blob') {
        character = new BlobCharacter(this, characterSize, colorConfig as BlobColorConfig);
      } else {
        character = new UnicornCharacter(this, characterSize, colorConfig as UnicornColorConfig);
      }
      character.container.setPosition(0, 0);

      container.add(character.container);
      this.colorPreviewContainers.push(container);
      this.colorPreviews.push(character);
      this.colorRowContainer.add(container);

      // Make character clickable
      const hitArea = this.add.circle(0, 0, characterSize / 2);
      hitArea.setInteractive();
      hitArea.on('pointerdown', () => {
        this.selectColor(index);
      });
      hitArea.on('pointerover', () => {
        container.setScale(1.1);
      });
      hitArea.on('pointerout', () => {
        container.setScale(1);
      });
      hitArea.setAlpha(0.01); // Nearly invisible but still clickable
      container.add(hitArea);
    });

    // Reset selection to first color
    this.selectedColorIndex = 0;
  }

  /**
   * Create start button
   */
  private createStartButton(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.startButton = this.add.container(width / 2, height * 0.75);

    // Button background
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x4ecdc4, 1);
    buttonBg.fillRoundedRect(-100, -30, 200, 60, 15);
    buttonBg.lineStyle(4, 0xffffff, 1);
    buttonBg.strokeRoundedRect(-100, -30, 200, 60, 15);

    // Button text
    const buttonText = this.add.text(0, 0, 'Start', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    buttonText.setOrigin(0.5);

    this.startButton.add([buttonBg, buttonText]);
    this.startButton.setInteractive(
      new Phaser.Geom.Rectangle(-100, -30, 200, 60),
      Phaser.Geom.Rectangle.Contains
    );

    // Hover effect
    this.startButton.on('pointerover', () => {
      this.startButton.setScale(1.1);
    });
    this.startButton.on('pointerout', () => {
      this.startButton.setScale(1);
    });

    // Click to start
    this.startButton.on('pointerdown', () => {
      this.startGame();
    });

    // Pulsing animation
    this.tweens.add({
      targets: this.startButton,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Select a character type
   */
  private selectCharacterType(type: CharacterType): void {
    // Hide all character type boxes
    this.characterTypeBoxes.forEach(box => box.setVisible(false));

    // Show selected box
    const index = type === 'blob' ? 0 : 1;
    this.characterTypeBoxes[index].setVisible(true);

    this.selectedCharacterType = type;

    // Show color selection for this character type
    this.createColorSelection(type);
    this.colorRowContainer.setVisible(true);

    // Show start button
    this.startButton.setVisible(true);
  }

  /**
   * Select a color scheme
   */
  private selectColor(index: number): void {
    if (index === this.selectedColorIndex) return;

    // Hide previous selection
    this.colorPreviewBoxes[this.selectedColorIndex].setVisible(false);

    // Show new selection
    this.selectedColorIndex = index;
    this.colorPreviewBoxes[this.selectedColorIndex].setVisible(true);
  }

  /**
   * Start the game with selected character and color
   */
  private startGame(): void {
    if (!this.selectedCharacterType) return;

    const colorPresets = this.selectedCharacterType === 'blob'
      ? ALL_BLOB_PRESETS
      : ALL_UNICORN_PRESETS;
    const selectedColorConfig = colorPresets[this.selectedColorIndex];

    // Start MainGameScene with selected character type, color, and difficulty
    this.scene.start('MainGameScene', {
      characterType: this.selectedCharacterType,
      characterColor: selectedColorConfig,
      difficulty: this.difficulty
    });
  }

  /**
   * Handle arrow key input
   */
  update(): void {
    if (!this.selectedCharacterType) {
      // Navigate character types with left/right arrows
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
        this.selectCharacterType('blob');
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
        this.selectCharacterType('unicorn');
      }
    } else {
      // Navigate colors with left/right arrows
      const colorPresets = this.selectedCharacterType === 'blob'
        ? ALL_BLOB_PRESETS
        : ALL_UNICORN_PRESETS;

      if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
        const newIndex = this.selectedColorIndex - 1;
        if (newIndex >= 0) {
          this.selectColor(newIndex);
        }
      }

      if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
        const newIndex = this.selectedColorIndex + 1;
        if (newIndex < colorPresets.length) {
          this.selectColor(newIndex);
        }
      }
    }
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    // Recreate UI for new size
    this.scene.restart();
  }
}
