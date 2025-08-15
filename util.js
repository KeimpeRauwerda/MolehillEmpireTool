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

// Constants for garden dimensions
export const GARDEN_WIDTH = 17;
export const GARDEN_HEIGHT = 12;

// Convert X,Y coordinates to tile number
export function coordsToTile(vector) {
  return vector.x + (vector.y - 1) * GARDEN_WIDTH;
}

export function getTileElement(vector) {
  const tileNum = coordsToTile(vector);
  return document.querySelector(`#gardenTile${tileNum}`);
}