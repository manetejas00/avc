const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  let newContent = content
    .replace(/green-primary/g, 'gold-primary')
    .replace(/green-secondary/g, 'gold-secondary')
    .replace(/16,185,129/g, '212,175,55') // RGB for #10b981 to #D4AF37
    .replace(/text-green-500/g, 'text-gold-primary')
    .replace(/bg-green-500/g, 'bg-gold-primary')
    .replace(/from-green\/10/g, 'from-gold-primary/10');

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
