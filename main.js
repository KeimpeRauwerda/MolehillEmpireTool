import { runAutomation } from './automation.js';

document.removeEventListener('keydown', keydownListener);
// Run the automation on numpad 0
function keydownListener(event) {
  if (event.key === '0') {
    runAutomation();
  }
}
document.addEventListener('keydown', keydownListener);

console.log('Molehill Empire automation loaded. Press 0 to run.');
