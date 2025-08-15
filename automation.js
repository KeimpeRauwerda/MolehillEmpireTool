import { Vector, coordsToTile } from './vector.js';

// seedTypes
export const seedTypes = {
  lettuce: 2,
  carrot: 6
};

// Plant seeds in a range of tiles
export async function plantRange(startVector, endVector, seedType = seedTypes.carrot) {
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
export async function waterRange(startVector, endVector) {
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

export async function plantAndWaterRange(startVector, endVector, seedType = seedTypes.carrot) {
  console.log(`Planting and watering from ${startVector.toString()} to ${endVector.toString()}`);

  // Plant seeds
  await plantRange(startVector, endVector, seedType);

  // Wait for planting to complete
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Water the same area
  await waterRange(startVector, endVector);
}

// Main automation sequence
export async function runAutomation() {
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