const fs = require('fs');
const path = require('path');

// Files in dependency order
const files = [
  'config.js',
  'utils.js',
  'statistics.js',
  'actions.js',
  'selection.js',
  'statisticsPanel.js',
  'menu.js',
  'main.js'
];

// CSS files to include
const cssFiles = [
  'styles.css'
];

// HTML templates to inject
const htmlTemplates = {
  'menu.js': {
    placeholder: '<!-- MENU_HTML_TEMPLATE_PLACEHOLDER -->',
    file: 'menu.html'
  },
  'statisticsPanel.js': {
    placeholder: '<!-- STATS_PANEL_HTML_TEMPLATE_PLACEHOLDER -->',
    file: 'statisticsPanel.html'
  }
};

function buildScript() {
  // Create dist directory if it doesn't exist
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  let combined = '';
  
  // Add header comment
  combined += '// Molehill Empire Automation - Built from multiple files\n\n';
  
  files.forEach(filename => {
    console.log(`Processing ${filename}...`);
    let content = fs.readFileSync(filename, 'utf8');
    
    // Inject HTML templates if needed
    if (htmlTemplates[filename]) {
      const template = htmlTemplates[filename];
      let htmlContent = fs.readFileSync(template.file, 'utf8');
      
      // Remove filepath comment from HTML
      htmlContent = htmlContent.replace(/^\/\/ filepath:.*$/m, '');
      
      // Escape backticks and special characters
      htmlContent = htmlContent
        .replace(/`/g, '\\`')
        .replace(/\${/g, '\\${');
      
      // Replace placeholder with HTML content
      content = content.replace(`\`${template.placeholder}\``, `\`${htmlContent}\``);
    }
    
    // Remove import/export statements
    content = content.replace(/^import.*?from.*?;$/gm, '');
    content = content.replace(/^export\s+/gm, '');
    
    // Remove filepath comments
    content = content.replace(/^\/\/ filepath:.*$/gm, '');
    
    // Clean up extra whitespace
    content = content.replace(/\n\n\n+/g, '\n\n');
    content = content.trim();
    
    combined += `// === ${filename} ===\n`;
    combined += content + '\n\n';
  });
  
  // Add CSS handling
  let cssContent = '';
  cssFiles.forEach(cssFile => {
    if (fs.existsSync(cssFile)) {
      console.log(`Processing CSS: ${cssFile}...`);
      const css = fs.readFileSync(cssFile, 'utf8');
      cssContent += css + '\n';
    } else {
      console.warn(`Warning: CSS file ${cssFile} not found.`);
    }
  });
  
  // Add CSS injection at the beginning
  if (cssContent) {
    const cssInjection = `
// Inject CSS styles
function injectStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = \`${cssContent.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;
  document.head.appendChild(styleElement);
}
injectStyles();
`;
    combined = cssInjection + '\n\n' + combined;
  }
  
  // Write to dist/molehill-automation.js
  const outputPath = path.join(distDir, 'molehill-automation.js');
  fs.writeFileSync(outputPath, combined);
  console.log(`Built successfully to ${outputPath}`);
}

buildScript();
