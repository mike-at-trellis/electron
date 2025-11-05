import { BlobColorConfig } from './BlobCharacter';

/**
 * Pink Blob Color Scheme (Original)
 * Warm, friendly pink character
 */
export const PinkBlobConfig: BlobColorConfig = {
  bodyPrimary: 0xff69b4,    // Hot pink
  bodySecondary: 0xff85c0,  // Lighter pink
  bodyHighlight: 0xffffff,  // White highlight
  eyeWhite: 0xffffff,       // White
  eyePupil: 0x000000,       // Black
  mouth: 0x000000,          // Black
};

/**
 * Blue Blob Color Scheme
 * Cool, calm blue character
 */
export const BlueBlobConfig: BlobColorConfig = {
  bodyPrimary: 0x4a90e2,    // Bright blue
  bodySecondary: 0x7ab8f5,  // Lighter blue
  bodyHighlight: 0xffffff,  // White highlight
  eyeWhite: 0xffffff,       // White
  eyePupil: 0x1a4d7a,       // Dark blue
  mouth: 0x1a4d7a,          // Dark blue
};

/**
 * All available blob color presets
 */
export const ALL_BLOB_PRESETS: BlobColorConfig[] = [
  PinkBlobConfig,
  BlueBlobConfig,
];
