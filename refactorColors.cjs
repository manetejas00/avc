const fs = require('fs');

function refactorColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/bg-\[#0B0F10\]/g, 'bg-bg-primary')
                   .replace(/bg-\[#141B1E\]/g, 'bg-bg-secondary')
                   .replace(/bg-\[#1F2B2F\]/g, 'bg-bg-elevated')
                   .replace(/bg-\[#182226\]/g, 'bg-bg-surface')
                   .replace(/bg-\[#223035\]/g, 'bg-bg-surface-ii')
                   .replace(/bg-\[#0D1214\]/g, 'bg-bg-primary')
                   .replace(/text-\[#D4AF37\]/g, 'text-gold-primary')
                   .replace(/text-\[#F5C542\]/g, 'text-gold-secondary')
                   .replace(/text-\[#071A1D\]/g, 'text-bg-primary')
                   .replace(/border-\[#D4AF37\]/g, 'border-gold-primary')
                   .replace(/border-\[#F5C542\]/g, 'border-gold-secondary')
                   .replace(/from-\[#D4AF37\]/g, 'from-gold-primary')
                   .replace(/via-\[#F5C542\]/g, 'via-gold-secondary')
                   .replace(/to-\[#B8860B\]/g, 'to-gold-dark')
                   .replace(/to-\[#F5C542\]/g, 'to-gold-secondary')
                   .replace(/ring-\[#D4AF37\]/g, 'ring-gold-primary')
                   .replace(/shadow-\[#D4AF37\]/g, 'shadow-gold-primary')
                   .replace(/bg-\[#D4AF37\]/g, 'bg-gold-primary')
                   .replace(/bg-\[#F5C542\]/g, 'bg-gold-secondary')
                   .replace(/group-hover:bg-\[#F5C542\]/g, 'group-hover:bg-gold-secondary')
                   .replace(/group-hover:text-\[#F5C542\]/g, 'group-hover:text-gold-secondary');
                   
  fs.writeFileSync(filePath, content);
}

refactorColors('src/components/Navbar.tsx');
refactorColors('src/components/Hero.tsx');
