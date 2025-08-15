const fs = require('fs');

// Files in dependency order
const files = [
  'util.js',
  'automation.js', 
  'main.js'
];

function buildScript() {
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
  
  // Write to dist.js
  fs.writeFileSync('dist.js', combined);
  console.log('Built successfully to dist.js');
}

buildScript();
