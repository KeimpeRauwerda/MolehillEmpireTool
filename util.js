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
