import { runAutomation } from './automation.js';
import { createAutomationMenu } from './menu.js';
import { initPlantSelection, plantAllSelections } from './selection.js';

document.removeEventListener('keydown', keydownListener);
// Run the automation on numpad 0
function keydownListener(event) {
  if (event.key === '0') {
    runAutomation();
  }
}
document.addEventListener('keydown', keydownListener);

// Initialize the automation menu when the page is fully loaded
if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}

function initialize() {
  createAutomationMenu();
  initPlantSelection();
  
  // Connect plant all button if it exists
  const plantAllButton = document.getElementById('plant-all-selections');
  if (plantAllButton) {
    plantAllButton.addEventListener('click', plantAllSelections);
  }
  
  // Make sure the create-more-selections button is visible
  const createMoreButton = document.getElementById('create-more-selections');
  if (createMoreButton) {
    createMoreButton.style.display = 'block';
  }
}

console.log('Molehill Empire automation loaded. Press 0 to run.');
