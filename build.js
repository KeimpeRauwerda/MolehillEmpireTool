const fs = require('fs');
const path = require('path');

// Files in dependency order
const files = [
  'config.js',
  'util.js',
  'actions.js',
  'automation.js', 
  'main.js'
];

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
  
  // Write to dist/molehill-automation.js
  const outputPath = path.join(distDir, 'molehill-automation.js');
  fs.writeFileSync(outputPath, combined);
  console.log(`Built successfully to ${outputPath}`);
}

buildScript();
