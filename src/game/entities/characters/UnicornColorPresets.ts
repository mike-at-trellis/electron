import { UnicornColorConfig } from "./UnicornCharacter";

/**
 * Rainbow Unicorn Color Scheme
 * Magical rainbow-themed unicorn with vibrant colors
 */
export const RainbowUnicornConfig: UnicornColorConfig = {
  bodyPrimary: 0xffffff,      // Pure white body
  bodySecondary: 0xffe6f0,    // Light pink tint
  bodyHighlight: 0xffffff,    // White highlight
  horn: 0xffd700,             // Golden horn
  hornGlow: 0xff00ff,         // Magenta magical glow
  manePrimary: 0xff69b4,      // Hot pink mane
  maneSecondary: 0x9370db,    // Purple highlights
  eyeWhite: 0xffffff,         // White
  eyePupil: 0x4169e1,         // Royal blue
  mouth: 0xff69b4,            // Pink mouth
};

/**
 * Midnight Unicorn Color Scheme
 * Dark, mysterious unicorn with mystical purple and blue tones
 */
export const MidnightUnicornConfig: UnicornColorConfig = {
  bodyPrimary: 0x2c3e50,      // Dark slate body
  bodySecondary: 0x34495e,    // Lighter slate
  bodyHighlight: 0x7f8c8d,    // Silver highlight
  horn: 0x9b59b6,             // Purple horn
  hornGlow: 0x00ffff,         // Cyan magical glow
  manePrimary: 0x6c5ce7,      // Deep purple mane
  maneSecondary: 0x00b4d8,    // Electric blue highlights
  eyeWhite: 0xe8f4f8,         // Off-white
  eyePupil: 0x9b59b6,         // Purple
  mouth: 0x6c5ce7,            // Purple mouth
};

/**
 * All available unicorn color presets
 */
export const ALL_UNICORN_PRESETS: UnicornColorConfig[] = [
  RainbowUnicornConfig,
  MidnightUnicornConfig,
];
