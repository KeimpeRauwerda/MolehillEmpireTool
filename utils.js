import { GARDEN_WIDTH } from './config.js';
import { CROP_COLORS } from './config.js';

// Vector type for tile coordinates
export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  toString() {
    return `(${this.x}, ${this.y})`;
  }
  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
  subtract(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }
  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }
  divide(scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  }
  distance(other) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }
  toArray() {
    return [this.x, this.y];
  }
}

// Convert X,Y coordinates to tile number
export function coordsToTile(vector) {
  return vector.x + (vector.y - 1) * GARDEN_WIDTH;
}

export function getTileElement(vector) {
  const tileNum = coordsToTile(vector);
  return document.querySelector(`#gardenTile${tileNum}`);
}

// Cache for generated random colors
const randomColorCache = new Map();

// Generate a random color for unknown crop types
export function getRandomCropColor(seedType) {
  if (randomColorCache.has(seedType)) {
    return randomColorCache.get(seedType);
  }
  
  // Generate random HSL color with good contrast
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 30); // 60-90%
  const lightness = 45 + Math.floor(Math.random() * 20); // 45-65%
  
  const border = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const bg = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`;
  
  const color = { bg, border, name: `Crop ${seedType}` };
  randomColorCache.set(seedType, color);
  
  return color;
}

// Get crop color (predefined or random)
export function getCropColor(seedType) {
  return CROP_COLORS[seedType] || getRandomCropColor(seedType);
}

// Get crop name
export function getCropName(seedType) {
  return getCropColor(seedType).name;
}

// Check if a tile has a fully grown crop (growth stage 4)
export function isFullyGrown(tileElement) {
  const plantImage = tileElement.querySelector('.plantImage');
  if (!plantImage) return false;
  
  const backgroundStyle = plantImage.style.background;
  if (!backgroundStyle) return false;
  
  // Extract the image filename from the background URL
  const urlMatch = backgroundStyle.match(/url\([^)]*\/([^/)]+)\)/);
  if (!urlMatch) return false;
  
  const filename = urlMatch[1];
  
  // Check if the filename indicates growth stage 4 (ends with _04.gif)
  return filename.includes('_04.gif');
}

// Find all fully grown crops within saved selections
export function findFullyGrownCropsInSelections(savedSelections) {
  const fullyGrownCrops = [];
  
  for (const selection of savedSelections) {
    for (let y = selection.point1.y; y <= selection.point2.y; y++) {
      for (let x = selection.point1.x; x <= selection.point2.x; x++) {
        const tileElement = getTileElement(new Vector(x, y));
        if (tileElement && isFullyGrown(tileElement)) {
          fullyGrownCrops.push({
            position: new Vector(x, y),
            selection: selection
          });
        }
      }
    }
  }
  
  return fullyGrownCrops;
}

// Check if a tile is empty (no plant)
export function isTileEmpty(tileElement) {
  const plantImage = tileElement.querySelector('.plantImage');
  if (!plantImage || !plantImage.style.background) return true;
  
  const backgroundStyle = plantImage.style.background;
  
  // Check if the background contains the empty tile image (0.gif)
  return backgroundStyle.includes('/0.gif') || backgroundStyle.includes('produkte/0.gif');
}

// Check if a tile can accept water (not stage 4 growth)
export function canWater(tileElement) {
  const plantImage = tileElement.querySelector('.plantImage');
  if (!plantImage || !plantImage.style.background) return false;
  
  const backgroundStyle = plantImage.style.background;
  
  // Check if the background does not contain stage 4 growth image
  return !backgroundStyle.includes('_04.gif') && !backgroundStyle.includes('produkte/04.gif');
}

// Find all empty tiles within saved selections
export function findEmptyTilesInSelections(savedSelections) {
  const emptyTiles = [];
  
  for (const selection of savedSelections) {
    for (let y = selection.point1.y; y <= selection.point2.y; y++) {
      for (let x = selection.point1.x; x <= selection.point2.x; x++) {
        const tileElement = getTileElement(new Vector(x, y));
        if (tileElement && isTileEmpty(tileElement)) {
          emptyTiles.push({
            position: new Vector(x, y),
            selection: selection
          });
        }
      }
    }
  }
  
  return emptyTiles;
}