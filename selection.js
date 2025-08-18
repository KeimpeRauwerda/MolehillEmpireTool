import { Vector, getTileElement, getCropColor, getCropName } from './util.js';
import { plantAndWaterRange } from './actions.js';
import { SEED_TYPES } from './config.js';

// Selection state
let selectionMode = false;
let firstPoint = null;
let secondPoint = null;
let highlightElement = null;
let mouseHoverPoint = null;
let savedSelections = [];

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
  
  // Dynamically populate seed buttons from config
  populateSeedButtons();
  
  // Load saved selections from localStorage
  loadSavedSelections();
  renderSavedSelections();
  
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
  
  // Set up seed selection buttons (now dynamically created)
  setupSeedButtonListeners();
  
  // Setup plant all button
  const plantAllButton = document.getElementById('plant-all-selections');
  if (plantAllButton) {
    plantAllButton.addEventListener('click', plantAllSelections);
  }
}

// Dynamically create seed buttons from SEED_TYPES config
function populateSeedButtons() {
  const seedButtonsContainer = document.querySelector('.seed-buttons');
  if (!seedButtonsContainer) return;
  
  // Clear existing buttons
  seedButtonsContainer.innerHTML = '';
  
  // Create buttons for each seed type in config
  Object.entries(SEED_TYPES).forEach(([name, seedType]) => {
    const button = document.createElement('button');
    button.className = 'seed-button';
    button.setAttribute('data-seed-type', seedType);
    button.textContent = getCropName(seedType);
    seedButtonsContainer.appendChild(button);
  });
}

// Set up event listeners for dynamically created seed buttons
function setupSeedButtonListeners() {
  const seedButtons = document.querySelectorAll('.seed-button');
  seedButtons.forEach(button => {
    button.addEventListener('click', () => {
      const seedType = parseInt(button.getAttribute('data-seed-type'));
      if (firstPoint && secondPoint) {
        // Check for overlaps with existing selections
        const newSelection = {
          point1: firstPoint,
          point2: secondPoint,
          seedType
        };
        
        if (checkForOverlap(newSelection)) {
          const statusText = document.getElementById('selection-status');
          statusText.textContent = 'Error: Selection overlaps with existing selection!';
          return;
        }
        
        // Add to saved selections instead of planting immediately
        savedSelections.push(newSelection);
        saveSavedSelections();
        renderSavedSelections();
        
        // Reset selection
        resetSelection();
        selectionMode = false;
        const selectButton = document.getElementById('select-plant-area');
        selectButton.classList.remove('active');
        const statusText = document.getElementById('selection-status');
        statusText.textContent = 'Selection saved!';
        const seedSelection = document.getElementById('seed-selection');
        seedSelection.style.display = 'none';
      }
    });
  });
}

// Check if a new selection overlaps with any existing selection
function checkForOverlap(newSelection) {
  for (const selection of savedSelections) {
    // Check if rectangles overlap
    const overlap = !(
      selection.point2.x < newSelection.point1.x || 
      selection.point1.x > newSelection.point2.x ||
      selection.point2.y < newSelection.point1.y ||
      selection.point1.y > newSelection.point2.y
    );
    
    if (overlap) return true;
  }
  return false;
}

// Save selections to localStorage
function saveSavedSelections() {
  const serialized = JSON.stringify(savedSelections.map(selection => ({
    point1: { x: selection.point1.x, y: selection.point1.y },
    point2: { x: selection.point2.x, y: selection.point2.y },
    seedType: selection.seedType
  })));
  
  localStorage.setItem('molehillSavedSelections', serialized);
}

// Load selections from localStorage
function loadSavedSelections() {
  const saved = localStorage.getItem('molehillSavedSelections');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      savedSelections = parsed.map(selection => ({
        point1: new Vector(selection.point1.x, selection.point1.y),
        point2: new Vector(selection.point2.x, selection.point2.y),
        seedType: selection.seedType
      }));
    } catch (e) {
      console.error('Error loading saved selections:', e);
      savedSelections = [];
    }
  }
}

// Render the saved selections in the UI
function renderSavedSelections() {
  const container = document.getElementById('saved-selections');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (savedSelections.length === 0) {
    container.innerHTML = '<p>No saved selections</p>';
    return;
  }
  
  savedSelections.forEach((selection, index) => {
    const item = document.createElement('div');
    item.className = `selection-item`;
    item.setAttribute('data-selection-index', index);
    
    // Get crop color and set CSS custom properties
    const cropColor = getCropColor(selection.seedType);
    item.style.setProperty('--crop-border-color', cropColor.border);
    item.style.borderLeftColor = cropColor.border;
    
    const size = {
      width: selection.point2.x - selection.point1.x + 1,
      height: selection.point2.y - selection.point1.y + 1
    };
    
    item.innerHTML = `
      <div class="selection-info">
        ${getCropName(selection.seedType)} (${size.width}x${size.height})
        <br>
        From ${selection.point1.toString()} to ${selection.point2.toString()}
      </div>
      <div class="selection-actions">
        <button class="selection-delete" data-index="${index}">Delete</button>
      </div>
    `;
    
    // Add hover event listeners for visualization - only when not actively selecting
    item.addEventListener('mouseenter', () => {
      // Don't show preview if we're in the middle of making a selection
      if (!selectionMode || (!firstPoint && !secondPoint)) {
        showSelectionHighlight(selection);
      }
    });
    
    item.addEventListener('mouseleave', () => {
      // Don't hide if we're in active selection mode with points selected
      if (!selectionMode || (!firstPoint && !secondPoint)) {
        hideSelectionHighlight();
      }
    });
    
    container.appendChild(item);
    
    // Add delete button listener
    const deleteBtn = item.querySelector('.selection-delete');
    deleteBtn.addEventListener('click', () => {
      savedSelections.splice(index, 1);
      saveSavedSelections();
      renderSavedSelections();
    });
  });
  
  // Show or hide plant all button
  const plantAllBtn = document.getElementById('plant-all-selections');
  if (plantAllBtn) {
    plantAllBtn.style.display = savedSelections.length > 0 ? 'block' : 'none';
  }
}

// Show highlight for a specific selection
function showSelectionHighlight(selection) {
  if (!highlightElement) return;
  
  const firstTileElement = getTileElement(selection.point1);
  const secondTileElement = getTileElement(selection.point2);
  
  if (!firstTileElement || !secondTileElement) return;
  
  const firstRect = firstTileElement.getBoundingClientRect();
  const secondRect = secondTileElement.getBoundingClientRect();
  
  const left = Math.min(firstRect.left, secondRect.left);
  const top = Math.min(firstRect.top, secondRect.top);
  const right = Math.max(firstRect.right, secondRect.right);
  const bottom = Math.max(firstRect.bottom, secondRect.bottom);
  
  // Get crop-specific color from config
  const colors = getCropColor(selection.seedType);
  
  highlightElement.style.left = `${left}px`;
  highlightElement.style.top = `${top}px`;
  highlightElement.style.width = `${right - left}px`;
  highlightElement.style.height = `${bottom - top}px`;
  highlightElement.style.display = 'block';
  highlightElement.style.backgroundColor = colors.bg;
  highlightElement.style.borderColor = colors.border;
}

// Hide selection highlight
function hideSelectionHighlight() {
  if (!highlightElement) return;
  
  // Only hide if we're not in active selection mode with points
  if (!selectionMode || (!firstPoint && !secondPoint)) {
    highlightElement.style.display = 'none';
    // Reset to default selection colors
    highlightElement.style.backgroundColor = 'rgba(46, 204, 113, 0.3)';
    highlightElement.style.borderColor = '#27ae60';
  }
}

// Plant and water all saved selections
export async function plantAllSelections() {
  const statusText = document.getElementById('selection-status');
  if (statusText) statusText.textContent = 'Planting all selections...';
  
  // Process each selection sequentially
  for (let i = 0; i < savedSelections.length; i++) {
    const selection = savedSelections[i];
    if (statusText) statusText.textContent = `Planting selection ${i+1} of ${savedSelections.length}...`;
    
    // Plant and water this selection
    await plantAndWaterRange(selection.point1, selection.point2, selection.seedType);
    
    // Small delay between selections to prevent game issues
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (statusText) statusText.textContent = 'All plantings complete!';
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

// Update highlight
function updateHighlight() {
  updatePreviewHighlight();
}
