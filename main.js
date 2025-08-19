import { createAutomationMenu } from './menu.js';
import { initPlantSelection, plantAllSelections } from './selection.js';

// Initialize the automation menu when the page is fully loaded
if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}

function initialize() {
  // Initialize statistics system
  initializeStatistics();
  
  createAutomationMenu();
  initPlantSelection();
  
  // Add statistics button to menu after a short delay to ensure menu is created
  setTimeout(() => {
    addStatisticsButtonToMenu();
  }, 100);
  
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

console.log('Molehill Empire automation loaded.');
