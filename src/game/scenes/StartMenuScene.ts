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
    const buttonText = this.add.text(0, 0, 'Start Game', {
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
      scaleX: 1.05,
      scaleY: 1.05,
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

    // Start MainGameScene with selected character type and color
    this.scene.start('MainGameScene', {
      characterType: this.selectedCharacterType,
      characterColor: selectedColorConfig
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
