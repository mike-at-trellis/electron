import Phaser from 'phaser';

/**
 * Create text with rainbow gradient effect
 * @param scene The Phaser scene
 * @param x X position
 * @param y Y position
 * @param text Text content
 * @param style Text style configuration
 * @returns A container with the rainbow text (use this for positioning/depth/scrollFactor)
 */
export function createRainbowText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  style: Phaser.Types.GameObjects.Text.TextStyle
): Phaser.GameObjects.Container {
  const rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff, 0x8b00ff];
  const textLength = text.length;

  // Create a container to hold individual character text objects
  const container = scene.add.container(x, y);
  const charTexts: Phaser.GameObjects.Text[] = [];

  // First pass: create all character text objects
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const colorIndex = Math.floor((i / textLength) * rainbowColors.length);
    const color = rainbowColors[colorIndex];

    const charText = scene.add.text(0, 0, char, style);
    charText.setTint(color);
    charTexts.push(charText);
  }

  // Calculate total width
  let totalWidth = 0;
  charTexts.forEach(ct => totalWidth += ct.width);

  // Second pass: position characters centered
  let currentX = -totalWidth / 2;
  charTexts.forEach(charText => {
    charText.setPosition(currentX, 0);
    currentX += charText.width;
    container.add(charText);
  });

  return container;
}
