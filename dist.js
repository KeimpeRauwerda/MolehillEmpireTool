// Molehill Empire Automation - Built from multiple files

// === util.js ===
// Vector type for tile coordinates
class Vector {
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
const GARDEN_WIDTH = 17;
const GARDEN_HEIGHT = 12;

// Convert X,Y coordinates to tile number
function coordsToTile(vector) {
  return vector.x + (vector.y - 1) * GARDEN_WIDTH;
}

function getTileElement(vector) {
  const tileNum = coordsToTile(vector);
  return document.querySelector(`#gardenTile${tileNum}`);
}

// === automation.js ===
// seedTypes
const seedTypes = {
  lettuce: 2,
  carrot: 6
};

// Plant seeds in a range of tiles
async function plantRange(startVector, endVector, seedType = seedTypes.carrot) {
  console.log(`Planting from ${startVector.toString()} to ${endVector.toString()}`);

  // Select seed type
  document.querySelector(`#regal_${seedType}`).click();
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  // Plant each tile in the range
  for (let y = startVector.y; y <= endVector.y; y++) {
    for (let x = startVector.x; x <= endVector.x; x++) {
      getTileElement({ x, y }).click();
    }
  }
}

// Water tiles in a range
async function waterRange(startVector, endVector) {
  console.log(`Watering from ${startVector.toString()} to ${endVector.toString()}`);
  
  // Select watering can
  document.querySelector('#giessen').click();
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  // Water each tile in the range
  for (let y = startVector.y; y <= endVector.y; y++) {
    for (let x = startVector.x; x <= endVector.x; x++) {
      getTileElement({ x, y }).click();
    }
  }
}

async function plantAndWaterRange(startVector, endVector, seedType = seedTypes.carrot) {
  console.log(`Planting and watering from ${startVector.toString()} to ${endVector.toString()}`);

  // Plant seeds
  await plantRange(startVector, endVector, seedType);

  // Wait for planting to complete
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Water the same area
  await waterRange(startVector, endVector);
}

// Main automation sequence
async function runAutomation() {
  // Area to plant and water
  console.log('Starting automation...'); 

  const selection = {
    point1: new Vector(1, 1),
    point2: new Vector(1, 1),
  };

  // Plant and water a specific area
  selection.point1 = new Vector(2, 3);
  selection.point2 = new Vector(7, 6);
  await plantAndWaterRange(selection.point1, selection.point2, seedTypes.lettuce);

  // Plant and water another area
  selection.point1 = new Vector(2, 7);
  selection.point2 = new Vector(7, 12);
  await plantAndWaterRange(selection.point1, selection.point2, seedTypes.carrot);

  console.log('Automation complete!');
}

// === main.js ===
// Run the automation on numpad 0
function keydownListener(event) {
  if (event.key === '0') {
    runAutomation();
  }
}

document.removeEventListener('keydown', keydownListener);
document.addEventListener('keydown', keydownListener);

console.log('Molehill Empire automation loaded. Press 0 to run.');

