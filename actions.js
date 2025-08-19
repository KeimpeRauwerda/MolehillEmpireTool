import { getTileElement, isFullyGrown, isTileEmpty, canWater, findFullyGrownCropsInSelections, findEmptyTilesInSelections, findWaterableTilesInSelections, Vector } from './utils.js';
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
      const tileElement = getTileElement(new Vector(x, y));
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
      const tileElement = getTileElement(new Vector(x, y));
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
      const tileElement = getTileElement(new Vector(x, y));
      
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

// New 3-stage automation function for all selections
export async function automateAllSelections(savedSelections, statusCallback) {
  if (!savedSelections || savedSelections.length === 0) {
    if (statusCallback) statusCallback('No selections to automate');
    return;
  }

  let totalProcessed = 0;

  try {
    // STAGE 1: Harvest all fully grown crops
    if (statusCallback) statusCallback('Stage 1/3: Checking for fully grown crops...');
    const fullyGrownCrops = findFullyGrownCropsInSelections(savedSelections);
    
    if (fullyGrownCrops.length > 0) {
      if (statusCallback) statusCallback(`Stage 1/3: Harvesting ${fullyGrownCrops.length} crops...`);
      
      // Select harvesting tool once
      const harvestTool = document.querySelector('#ernten');
      if (harvestTool) {
        harvestTool.click();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Harvest all fully grown crops
      for (const crop of fullyGrownCrops) {
        const tileElement = getTileElement(crop.position);
        if (tileElement) {
          tileElement.click();
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      totalProcessed += fullyGrownCrops.length;
      if (statusCallback) statusCallback(`Stage 1/3: Harvested ${fullyGrownCrops.length} crops`);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      if (statusCallback) statusCallback('Stage 1/3: No crops ready for harvest');
    }

    // STAGE 2: Plant all empty tiles with their designated crops
    if (statusCallback) statusCallback('Stage 2/3: Checking for empty tiles...');
    const emptyTiles = findEmptyTilesInSelections(savedSelections);
    
    if (emptyTiles.length > 0) {
      if (statusCallback) statusCallback(`Stage 2/3: Planting ${emptyTiles.length} tiles...`);
      
      // Group empty tiles by seed type for efficient planting
      const tilesBySeedType = new Map();
      
      for (const tile of emptyTiles) {
        const seedType = tile.selection.seedType;
        if (!tilesBySeedType.has(seedType)) {
          tilesBySeedType.set(seedType, []);
        }
        tilesBySeedType.get(seedType).push(tile.position);
      }
      
      // Plant each seed type
      for (const [seedType, positions] of tilesBySeedType.entries()) {
        // Select seed type once
        const seedElement = document.querySelector(`#regal_${seedType}`);
        if (seedElement) {
          seedElement.click();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Plant all tiles of this seed type
        for (const position of positions) {
          const tileElement = getTileElement(position);
          if (tileElement) {
            tileElement.click();
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      }
      
      totalProcessed += emptyTiles.length;
      if (statusCallback) statusCallback(`Stage 2/3: Planted ${emptyTiles.length} tiles`);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      if (statusCallback) statusCallback('Stage 2/3: No empty tiles to plant');
    }

    // STAGE 3: Water all tiles that need watering (always check regardless of previous stages)
    if (statusCallback) statusCallback('Stage 3/3: Checking all tiles for watering...');
    const waterableTiles = findWaterableTilesInSelections(savedSelections);
    
    if (waterableTiles.length > 0) {
      if (statusCallback) statusCallback(`Stage 3/3: Watering ${waterableTiles.length} tiles...`);
      
      // Select watering can once
      const waterTool = document.querySelector('#giessen');
      if (waterTool) {
        waterTool.click();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Water all tiles that need it
      for (const tile of waterableTiles) {
        const tileElement = getTileElement(tile.position);
        if (tileElement && canWater(tileElement)) { // Double-check before watering
          tileElement.click();
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      totalProcessed += waterableTiles.length;
      if (statusCallback) statusCallback(`Stage 3/3: Watered ${waterableTiles.length} tiles`);
    } else {
      if (statusCallback) statusCallback('Stage 3/3: No tiles need watering');
    }

    if (statusCallback) {
      statusCallback(`Automation complete! Processed ${totalProcessed} actions total (${fullyGrownCrops.length} harvested, ${emptyTiles.length} planted, ${waterableTiles.length} watered)`);
    }

  } catch (error) {
    console.error('Automation error:', error);
    if (statusCallback) statusCallback(`Automation error: ${error.message}`);
  }
}