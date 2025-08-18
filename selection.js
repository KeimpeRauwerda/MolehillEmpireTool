import { Vector, getTileElement } from './util.js';
import { plantAndWaterRange } from './actions.js';

// Selection state
let selectionMode = false;
let firstPoint = null;
let secondPoint = null;
let highlightElement = null;
let mouseHoverPoint = null;

// Initialize the selection system
export function initPlantSelection() {
  const selectButton = document.getElementById('select-plant-area');
  const statusText = document.getElementById('selection-status');
  const seedSelection = document.getElementById('seed-selection');
  
  // Create highlight element
  highlightElement = document.createElement('div');
  highlightElement.className = 'tile-highlight';
  highlightElement.style.display = 'none';
  document.body.appendChild(highlightElement);
  
  // Toggle selection mode
  selectButton.addEventListener('click', () => {
    selectionMode = !selectionMode;
    resetSelection();
    
    if (selectionMode) {
      selectButton.classList.add('active');
      statusText.textContent = 'Select first corner tile...';
      addTileListeners();
    } else {
      selectButton.classList.remove('active');
      statusText.textContent = '';
      removeTileListeners();
      seedSelection.style.display = 'none';
    }
  });
  
  // Set up seed selection buttons
  const seedButtons = document.querySelectorAll('.seed-button');
  seedButtons.forEach(button => {
    button.addEventListener('click', () => {
      const seedType = parseInt(button.getAttribute('data-seed-type'));
      if (firstPoint && secondPoint) {
        plantAndWaterRange(firstPoint, secondPoint, seedType);
        resetSelection();
        selectionMode = false;
        selectButton.classList.remove('active');
        statusText.textContent = 'Planting complete!';
        seedSelection.style.display = 'none';
      }
    });
  });
}

// Add click listeners to all garden tiles
function addTileListeners() {
  const garden = document.getElementById('gardenDiv');
  if (garden) {
    garden.addEventListener('click', handleGardenClick, true);
    garden.addEventListener('mousemove', handleGardenMouseMove, true);
  }
}

// Remove click listeners
function removeTileListeners() {
  const garden = document.getElementById('gardenDiv');
  if (garden) {
    garden.removeEventListener('click', handleGardenClick, true);
    garden.removeEventListener('mousemove', handleGardenMouseMove, true);
  }
}

// Handle mouse movement over the garden
function handleGardenMouseMove(event) {
  if (!selectionMode || !firstPoint || secondPoint) return;
  
  const tileElement = event.target.closest('[id^="gardenTile"]');
  if (!tileElement) return;
  
  // Parse the tile number to get coordinates
  const tileId = tileElement.id;
  const tileNum = parseInt(tileId.replace('gardenTile', ''));
  
  // Convert tile number to x,y coordinates
  const coords = tileNumberToCoords(tileNum);
  const vector = new Vector(coords.x, coords.y);
  
  // Update hover point and preview
  mouseHoverPoint = vector;
  updatePreviewHighlight();
}

// Handle clicks on the garden
function handleGardenClick(event) {
  if (!selectionMode) return;
  
  // Find the clicked tile
  const tileElement = event.target.closest('[id^="gardenTile"]');
  if (!tileElement) return;
  
  // Parse the tile number to get coordinates
  const tileId = tileElement.id;
  const tileNum = parseInt(tileId.replace('gardenTile', ''));
  
  // Convert tile number to x,y coordinates
  const coords = tileNumberToCoords(tileNum);
  const vector = new Vector(coords.x, coords.y);
  
  const statusText = document.getElementById('selection-status');
  const seedSelection = document.getElementById('seed-selection');
  
  // First or second point selection
  if (!firstPoint) {
    firstPoint = vector;
    mouseHoverPoint = vector; // Initialize hover point
    statusText.textContent = `First corner: ${vector.toString()}. Select second corner...`;
    updatePreviewHighlight(); // Show initial highlight
  } else if (!secondPoint) {
    secondPoint = vector;
    
    // Normalize the points (ensure point1 has smaller coordinates than point2)
    const normalizedPoints = normalizePoints(firstPoint, secondPoint);
    firstPoint = normalizedPoints.point1;
    secondPoint = normalizedPoints.point2;
    
    statusText.textContent = `Area selected: ${firstPoint.toString()} to ${secondPoint.toString()}`;
    seedSelection.style.display = 'block';
    
    // Show the highlight
    updateHighlight();
  }
  
  // Prevent the game from processing the click
  event.stopPropagation();
  event.preventDefault();
}

// Reset the selection state
function resetSelection() {
  firstPoint = null;
  secondPoint = null;
  mouseHoverPoint = null;
  
  if (highlightElement) {
    highlightElement.style.display = 'none';
  }
}

// Update the highlight preview based on hover position
function updatePreviewHighlight() {
  if (!firstPoint || !mouseHoverPoint || !highlightElement) return;
  
  // Normalize the points for preview
  const normalizedPoints = normalizePoints(firstPoint, mouseHoverPoint);
  const previewFirst = normalizedPoints.point1;
  const previewSecond = normalizedPoints.point2;
  
  const firstTileElement = getTileElement(previewFirst);
  const secondTileElement = getTileElement(previewSecond);
  
  if (!firstTileElement || !secondTileElement) return;
  
  const firstRect = firstTileElement.getBoundingClientRect();
  const secondRect = secondTileElement.getBoundingClientRect();
  
  const left = Math.min(firstRect.left, secondRect.left);
  const top = Math.min(firstRect.top, secondRect.top);
  const right = Math.max(firstRect.right, secondRect.right);
  const bottom = Math.max(firstRect.bottom, secondRect.bottom);
  
  highlightElement.style.left = `${left}px`;
  highlightElement.style.top = `${top}px`;
  highlightElement.style.width = `${right - left}px`;
  highlightElement.style.height = `${bottom - top}px`;
  highlightElement.style.display = 'block';
}

// Convert tile number to x,y coordinates
function tileNumberToCoords(tileNum) {
  const GARDEN_WIDTH = 17; // Using constant from config.js
  
  // The formula is: tileNum = x + (y-1) * GARDEN_WIDTH
  // So we solve for x and y:
  // y = Math.floor((tileNum - 1) / GARDEN_WIDTH) + 1
  // x = tileNum - (y-1) * GARDEN_WIDTH
  
  const y = Math.floor((tileNum - 1) / GARDEN_WIDTH) + 1;
  const x = tileNum - (y - 1) * GARDEN_WIDTH;
  
  return { x, y };
}

// Ensure point1 has smaller coordinates than point2
function normalizePoints(point1, point2) {
  return {
    point1: new Vector(
      Math.min(point1.x, point2.x),
      Math.min(point1.y, point2.y)
    ),
    point2: new Vector(
      Math.max(point1.x, point2.x),
      Math.max(point1.y, point2.y)
    )
  };
}
