import { runAutomation } from './automation.js';
import { createAutomationMenu } from './menu.js';

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
  createAutomationMenu();
} else {
  window.addEventListener('load', createAutomationMenu);
}

console.log('Molehill Empire automation loaded. Press 0 to run.');
