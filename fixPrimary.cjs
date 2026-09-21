const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  let newContent = content
    .replace(/\bbg-bg-secondary-ii\b/g, 'bg-bg-elevated')
    .replace(/\bbg-primary\/10\b/g, 'bg-gold-primary/10')
    .replace(/\bbg-primary\/20\b/g, 'bg-gold-primary/20')
    .replace(/\bbg-primary\/80\b/g, 'bg-gold-primary/80')
    .replace(/\bborder-primary\/50\b/g, 'border-gold-primary/50')
    .replace(/\bborder-primary\/30\b/g, 'border-gold-primary/30')
    .replace(/\bborder-primary\b/g, 'border-gold-primary')
    .replace(/\btext-primary\b/g, 'text-gold-primary')
    .replace(/\btext-text-primary-muted\b/g, 'text-text-muted')
    .replace(/\bhover:border-gold-primary\b/g, 'hover:border-gold-primary')
    .replace(/\bbg-gold-primary-primary\b/g, 'bg-gold-primary')
    .replace(/\btext-gold-primary-secondary\b/g, 'text-gold-secondary')
    .replace(/\btext-green-primary-500\b/g, 'text-green-primary')
    .replace(/\btext-bg-primary text-white\b/g, 'text-white')
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
