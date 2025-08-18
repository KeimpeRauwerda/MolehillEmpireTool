import { getTileElement } from './util.js';
import { SEED_TYPES } from './config.js';

// Plant seeds in a range of tiles
export async function plantRange(startVector, endVector, seedType = SEED_TYPES[0]) {
  console.log(`Planting ${seedType} from ${startVector.toString()} to ${endVector.toString()}`);

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

export async function plantAndWaterRange(startVector, endVector, seedType = SEED_TYPES[0]) {
  console.log(`Planting and watering ${seedType} from ${startVector.toString()} to ${endVector.toString()}`);

  // Plant seeds
  await plantRange(startVector, endVector, seedType);

  // Wait for planting to complete
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Water the same area
  await waterRange(startVector, endVector);
}