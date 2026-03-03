const sharp = require('sharp');
const path = require('path');

async function convertIcon() {
  const input = path.join(__dirname, '..', 'build', 'icon.svg');
  const outputDir = path.join(__dirname, '..', 'build');

  console.log('Converting icon.svg to PNG formats...\n');

  // Generate PNG files for different uses
  const sizes = [16, 32, 64, 128, 256, 512];

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(input)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Main icon.png (512x512) - used for Linux
  await sharp(input)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'icon.png'));
  console.log('\n✓ Generated icon.png (512x512)');

  // Generate ICO file for Windows
  await sharp(input)
    .resize(256, 256)
    .toFile(path.join(outputDir, 'icon.ico'));
  console.log('✓ Generated icon.ico (256x256)');

  console.log('\n✅ All icons generated successfully!');
  console.log('\nFiles created in build/:');
  console.log('  - icon.svg (source)');
  console.log('  - icon.png (512x512, for Linux)');
  console.log('  - icon.ico (for Windows)');
  console.log('  - icon-*.png (various sizes)');
  console.log('\nFor macOS .icns file:');
  console.log('  npm install --save-dev icns');
  console.log('  Then run: node scripts/generate-icns.js');
}

convertIcon().catch(console.error);
