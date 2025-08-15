// HTML template will be injected here during build
const MENU_HTML_TEMPLATE = `<!-- MENU_HTML_TEMPLATE_PLACEHOLDER -->`;

// Create automation menu UI
export function createAutomationMenu() {
  // Create a container element to hold our HTML
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = MENU_HTML_TEMPLATE.trim();
  
  // Get the menu container from the template
  const menuContainer = tempContainer.firstChild;
  menuContainer.classList.add('molehill-menu-container');
  
  // Position relative to contentwrapper and align with both menubg and rahmen_quer
  const contentWrapper = document.getElementById('contentwrapper');
  const menubg = document.getElementById('menubg');
  const rahmenQuer = document.getElementById('rahmen_quer');
  
  if (contentWrapper) {
    const contentRect = contentWrapper.getBoundingClientRect();
    menuContainer.style.left = (contentRect.right + 20) + 'px';
    
    if (menubg && rahmenQuer) {
      const menubgRect = menubg.getBoundingClientRect();
      const rahmenRect = rahmenQuer.getBoundingClientRect();
      
      // Align the top of the menu with the top of menubg
      menuContainer.style.top = menubgRect.top + 'px';
      
      // Set a fixed height that exactly spans from menubg top to rahmen_quer bottom
      const exactHeight = rahmenRect.bottom - menubgRect.top;
      menuContainer.style.height = `${exactHeight}px`;
    } else {
      menuContainer.style.top = contentRect.top + 'px';
    }
  } else {
    // Fallback position if contentwrapper not found
    menuContainer.style.right = '20px';
    menuContainer.style.top = '50px';
  }
  
  // Add to document
  document.body.appendChild(menuContainer);
  
  return menuContainer;
}