import { runAutomation } from './automation.js';
import { createAutomationMenu } from './menu.js';
import { initPlantSelection } from './selection.js';

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
}

console.log('Molehill Empire automation loaded. Press 0 to run.');
