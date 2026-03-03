const fs = require('fs');
const path = require('path');

// Simple orange circle icon (placeholder)
// For production, replace with actual icon file

const size = 512;
const centerX = size / 2;
const centerY = size / 2;
const radius = size / 2 - 10;

// Create SVG content
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#f97316"/>
  
  <!-- Circle -->
  <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="url(#grad)" stroke="#ffffff" stroke-width="8"/>
  
  <!-- Clock face -->
  <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.6}" fill="#ffffff" opacity="0.9"/>
  
  <!-- Clock hands -->
  <line x1="${centerX}" y1="${centerY}" x2="${centerX}" y2="${centerY - radius * 0.4}" stroke="#1e293b" stroke-width="8" stroke-linecap="round"/>
  <line x1="${centerX}" y1="${centerY}" x2="${centerX + radius * 0.4}" y2="${centerY}" stroke="#1e293b" stroke-width="8" stroke-linecap="round"/>
  <circle cx="${centerX}" cy="${centerY}" r="12" fill="#f97316"/>
  
  <!-- Text -->
  <text x="${centerX}" y="${size - 40}" font-size="48" font-weight="bold" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif">POMO</text>
</svg>`;

const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

fs.writeFileSync(path.join(buildDir, 'icon.svg'), svg);
console.log('✓ Generated build/icon.svg');

// Also create a simple PNG placeholder (1x1 orange pixel, will be replaced)
// For actual PNG, use: npm install sharp && node scripts/create-icon.js
console.log('');
console.log('To convert SVG to PNG, install sharp:');
console.log('  npm install --save-dev sharp');
console.log('  Then run: node scripts/convert-icon.js');
