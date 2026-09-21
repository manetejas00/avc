const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/bg-bg-primary/g, 'bg-background')
    .replace(/bg-bg-secondary/g, 'bg-surface')
    .replace(/bg-bg-elevated/g, 'bg-surface-elevated')
    .replace(/bg-bg-surface/g, 'bg-surface')
    .replace(/bg-bg-bg-secondary/g, 'bg-surface')
    .replace(/bg-bg-bg-elevated/g, 'bg-surface-elevated')
    .replace(/text-text-primary/g, 'text-text')
    .replace(/text-text-secondary/g, 'text-text-secondary')
    .replace(/text-text-muted/g, 'text-text-muted')
    .replace(/gold-dark/g, 'gold-muted')
    .replace(/text-gold-primary-primary/g, 'text-gold-primary')
    .replace(/bg-bg-gold-primary/g, 'bg-gold-primary');
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
