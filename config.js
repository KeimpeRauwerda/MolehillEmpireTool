// Garden dimensions
export const GARDEN_WIDTH = 17;
export const GARDEN_HEIGHT = 12;

// Configuration for auto-harvest feature
export const AUTO_HARVEST_CHECK_INTERVAL = 30000;

// Tool types
export const TOOLS = {
  WATERING_CAN: 'giessen'
};

// Seed/crop types
export const SEED_TYPES = {
  LETTUCE: 2,
  STRAWBERRY: 3,
  TOMATO: 5,
  CARROT: 6,
  CUCUMBER: 12,
  RADISH: 14
};

// Crop colors configuration
export const CROP_COLORS = {
  [SEED_TYPES.LETTUCE]: { bg: 'rgba(46, 204, 113, 0.3)', border: '#2ecc71', name: 'Lettuce' },
  [SEED_TYPES.CARROT]: { bg: 'rgba(243, 156, 18, 0.3)', border: '#f39c12', name: 'Carrot' },
  [SEED_TYPES.CUCUMBER]: { bg: 'rgba(155, 89, 182, 0.3)', border: '#9b59b6', name: 'Cucumber' },
  [SEED_TYPES.RADISH]: { bg: 'rgba(231, 76, 60, 0.3)', border: '#e74c3c', name: 'Radish' },
  [SEED_TYPES.STRAWBERRY]: { bg: 'rgba(220, 20, 60, 0.3)', border: '#dc143c', name: 'Strawberry' },
  [SEED_TYPES.TOMATO]: { bg: 'rgba(255, 99, 71, 0.3)', border: '#ff6347', name: 'Tomato' }
};

// Non-crop types that should not be considered harvestable crops
export const NON_CROP_TYPES = [
  'unkraut',      // weeds
  'steine',       // stones
  'baumstumpf',   // tree stumps
  'maulwurf'      // moles
];
