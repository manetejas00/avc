const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace old tailwind classes with new ones
  let newContent = content
    .replace(/\bbg-background\b/g, 'bg-bg-primary')
    .replace(/\bbg-surface\b/g, 'bg-bg-secondary')
    .replace(/\bbg-surface-ii\b/g, 'bg-bg-elevated')
    .replace(/\bborder-border\b/g, 'border-white/5') // border-border is now very subtle
    .replace(/\btext-text\b/g, 'text-text-primary')
    .replace(/\btext-text-muted\b/g, 'text-text-muted')
    .replace(/\bbg-gold\b/g, 'bg-gold-primary')
    .replace(/\btext-gold\b/g, 'text-gold-primary')
    .replace(/\bbg-green\b/g, 'bg-green-primary')
    .replace(/\btext-green\b/g, 'text-green-primary')
    .replace(/\bhover:bg-surface-ii\b/g, 'hover:bg-bg-elevated')
    .replace(/\bhover:text-primary\b/g, 'hover:text-green-primary')
    // Hero buttons
    .replace(/\bbg-primary hover:bg-primary\/90\b/g, 'bg-green-primary hover:bg-green-secondary text-bg-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]')
    ;

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      replaceInFile(dirPath);
    }
  });
}

walkDir('src/components');
