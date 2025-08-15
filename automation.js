import { Vector } from './util.js';
import { SEED_TYPES } from './config.js';

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
  await plantAndWaterRange(selection.point1, selection.point2, SEED_TYPES.LETTUCE);

  // Plant and water another area
  selection.point1 = new Vector(2, 7);
  selection.point2 = new Vector(7, 12);
  await plantAndWaterRange(selection.point1, selection.point2, SEED_TYPES.CARROT);

  console.log('Automation complete!');
}