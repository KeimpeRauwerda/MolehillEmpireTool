import { getTileElement, isFullyGrown } from './utils.js';
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
      const tileElement = getTileElement({ x, y });
      if (!tileElement || !isTileEmpty(tileElement)) {
        continue; // Skip if tile is not empty
      }
      tileElement.click();
      await new Promise(resolve => requestAnimationFrame(resolve));
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
      const tileElement = getTileElement({ x, y });
      if (!tileElement || !canWater(tileElement)) {
        continue; // Skip if tile cannot be watered
      }
      tileElement.click();
      await new Promise(resolve => requestAnimationFrame(resolve));
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

// Harvest a range of tiles
export async function harvestRange(startVector, endVector) {
  console.log(`Harvesting from ${startVector.toString()} to ${endVector.toString()}`);

  // Select harvesting tool
  document.querySelector('#ernten').click();
  await new Promise(resolve => requestAnimationFrame(resolve));

  let harvestedCount = 0;
  let skippedCount = 0;

  // Harvest each tile in the range
  for (let y = startVector.y; y <= endVector.y; y++) {
    for (let x = startVector.x; x <= endVector.x; x++) {
      const tileElement = getTileElement({ x, y });
      
      // Only harvest if the crop is fully grown (stage 4)
      if (isFullyGrown(tileElement)) {
        tileElement.click();
        harvestedCount++;
        await new Promise(resolve => requestAnimationFrame(resolve));
      } else {
        skippedCount++;
        console.log(`Skipping tile (${x}, ${y}) - not fully grown`);
      }
    }
  }
  
  console.log(`Harvest complete: ${harvestedCount} tiles harvested, ${skippedCount} tiles skipped`);
}