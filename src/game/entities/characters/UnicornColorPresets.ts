import { UnicornColorConfig } from "./UnicornCharacter";
import * as Colors from "./ColorConstants";

/**
 * Rainbow Unicorn Color Scheme
 * Magical rainbow-themed unicorn with vibrant colors
 */
export const RainbowUnicornConfig: UnicornColorConfig = {
  bodyPrimary: Colors.WHITE,           // Pure white body
  bodySecondary: Colors.LIGHT_PINK_TINT, // Light pink tint
  bodyHighlight: Colors.WHITE,         // White highlight
  horn: Colors.GOLDEN,                 // Golden horn
  hornGlow: Colors.MAGENTA,            // Magenta magical glow
  manePrimary: Colors.HOT_PINK,        // Hot pink mane
  maneSecondary: Colors.PURPLE,        // Purple highlights
  eyeWhite: Colors.WHITE,              // White
  eyePupil: Colors.ROYAL_BLUE,         // Royal blue
  mouth: Colors.HOT_PINK,              // Pink mouth
};

/**
 * Midnight Unicorn Color Scheme
 * Dark, mysterious unicorn with mystical purple and blue tones
 */
export const MidnightUnicornConfig: UnicornColorConfig = {
  bodyPrimary: Colors.DARK_SLATE,      // Dark slate body
  bodySecondary: Colors.LIGHTER_SLATE, // Lighter slate
  bodyHighlight: Colors.SILVER,        // Silver highlight
  horn: Colors.PURPLE_AMETHYST,        // Purple horn
  hornGlow: Colors.CYAN,               // Cyan magical glow
  manePrimary: Colors.DEEP_PURPLE,     // Deep purple mane
  maneSecondary: Colors.ELECTRIC_BLUE, // Electric blue highlights
  eyeWhite: Colors.OFF_WHITE,          // Off-white
  eyePupil: Colors.PURPLE_AMETHYST,    // Purple
  mouth: Colors.DEEP_PURPLE,           // Purple mouth
};

/**
 * Forest Unicorn Color Scheme
 * Nature-inspired unicorn with earthy green tones
 */
export const ForestUnicornConfig: UnicornColorConfig = {
  bodyPrimary: Colors.WHITE,           // White body
  bodySecondary: Colors.MINT_GREEN,    // Mint green tint
  bodyHighlight: Colors.LIGHT_YELLOW,  // Light yellow highlight
  horn: Colors.EMERALD,                // Emerald horn
  hornGlow: Colors.LIME_GREEN,         // Lime green magical glow
  manePrimary: Colors.FOREST_GREEN,    // Forest green mane
  maneSecondary: Colors.EMERALD,       // Emerald highlights
  eyeWhite: Colors.WHITE,              // White
  eyePupil: Colors.FOREST_GREEN,       // Forest green
  mouth: Colors.EMERALD,               // Emerald mouth
};

/**
 * Sunset Unicorn Color Scheme
 * Warm sunset-themed unicorn with vibrant orange and magenta hues
 */
export const SunsetUnicornConfig: UnicornColorConfig = {
  bodyPrimary: Colors.CORAL,           // Vibrant coral body
  bodySecondary: Colors.SUNSET_ORANGE, // Sunset orange tint
  bodyHighlight: Colors.GOLDEN_YELLOW, // Golden highlight
  horn: Colors.GOLDEN,                 // Golden horn
  hornGlow: Colors.ROSE,               // Rose magenta magical glow
  manePrimary: Colors.SUNSET_ORANGE,   // Sunset orange mane
  maneSecondary: Colors.ROSE,          // Rose magenta highlights
  eyeWhite: Colors.WHITE,              // White
  eyePupil: Colors.CRIMSON,            // Crimson
  mouth: Colors.ROSE,                  // Rose mouth
};

/**
 * All available unicorn color presets
 */
export const ALL_UNICORN_PRESETS: UnicornColorConfig[] = [
  RainbowUnicornConfig,
  MidnightUnicornConfig,
  ForestUnicornConfig,
  SunsetUnicornConfig,
];
