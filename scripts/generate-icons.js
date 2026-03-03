const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = {
  png: [16, 32, 64, 128, 256, 512],
  ico: [16, 32, 48, 256],
};

async function generateIcons() {
  const input = path.join(__dirname, '..', 'build', 'icon.svg');
  const outputDir = path.join(__dirname, '..', 'build');

  console.log('Generating icons from icon.svg...');

  // Generate PNG files
  for (const size of SIZES.png) {
    const outputPath = path.join(outputDir, `icon${size > 256 ? '' : `-${size}`}.png`);
    await sharp(input)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated icon-${size}.png`);
  }

  // Generate main icon.png (512x512)
  await sharp(input)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'icon.png'));
  console.log('✓ Generated icon.png');

  console.log('\nIcons generated successfully!');
  console.log('For .ico and .icns files, use additional tools:');
  console.log('  - .ico: npm install -g png2ico && png2ico build/icon.ico build/icon-*.png');
  console.log('  - .icns: Use png2icns or online converter');
}

generateIcons().catch(console.error);
