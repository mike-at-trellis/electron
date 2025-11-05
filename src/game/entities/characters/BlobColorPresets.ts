import { BlobColorConfig } from './BlobCharacter';
import * as Colors from './ColorConstants';

/**
 * Pink Blob Color Scheme (Original)
 * Warm, friendly pink character
 */
export const PinkBlobConfig: BlobColorConfig = {
  bodyPrimary: Colors.HOT_PINK,       // Hot pink
  bodySecondary: Colors.LIGHTER_PINK, // Lighter pink
  bodyHighlight: Colors.WHITE,        // White highlight
  eyeWhite: Colors.WHITE,             // White
  eyePupil: Colors.BLACK,             // Black
  mouth: Colors.BLACK,                // Black
};

/**
 * Blue Blob Color Scheme
 * Cool, calm blue character
 */
export const BlueBlobConfig: BlobColorConfig = {
  bodyPrimary: Colors.BRIGHT_BLUE,    // Bright blue
  bodySecondary: Colors.LIGHTER_BLUE, // Lighter blue
  bodyHighlight: Colors.WHITE,        // White highlight
  eyeWhite: Colors.WHITE,             // White
  eyePupil: Colors.DARK_BLUE,         // Dark blue
  mouth: Colors.DARK_BLUE,            // Dark blue
};

/**
 * Green Blob Color Scheme
 * Fresh, lively green character
 */
export const GreenBlobConfig: BlobColorConfig = {
  bodyPrimary: Colors.EMERALD,        // Emerald green
  bodySecondary: Colors.MINT_GREEN,   // Mint green
  bodyHighlight: Colors.WHITE,        // White highlight
  eyeWhite: Colors.WHITE,             // White
  eyePupil: Colors.FOREST_GREEN,      // Forest green
  mouth: Colors.FOREST_GREEN,         // Forest green
};

/**
 * Purple Blob Color Scheme
 * Mystical, enchanting purple character
 */
export const PurpleBlobConfig: BlobColorConfig = {
  bodyPrimary: Colors.DEEP_PURPLE,    // Deep purple
  bodySecondary: Colors.PURPLE,       // Medium purple
  bodyHighlight: Colors.WHITE,        // White highlight
  eyeWhite: Colors.WHITE,             // White
  eyePupil: Colors.PURPLE_AMETHYST,   // Amethyst purple
  mouth: Colors.PURPLE_AMETHYST,      // Amethyst purple
};

/**
 * All available blob color presets
 */
export const ALL_BLOB_PRESETS: BlobColorConfig[] = [
  PinkBlobConfig,
  BlueBlobConfig,
  GreenBlobConfig,
  PurpleBlobConfig,
];
