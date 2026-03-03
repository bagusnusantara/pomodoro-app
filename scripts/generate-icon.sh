#!/bin/bash
# Quick icon generator using ImageMagick

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

cd "$(dirname "$0")/.."

# Create build directory if not exists
mkdir -p build

# Generate icon using ImageMagick
convert -size 512x512 \
    -gravity center \
    -fill '#f97316' \
    circle 256,256 256,16 \
    -fill '#22c55e' \
    circle 256,256 256,100 \
    -fill '#ffffff' \
    circle 256,280 256,180 \
    -fill '#1e293b' \
    -draw "line 256,280 256,220" \
    -draw "line 256,280 320,280" \
    -fill '#f97316' \
    circle 256,280 256,270 \
    build/icon.png

echo "✓ Generated build/icon.png"

# Generate sizes for electron-builder
convert build/icon.png -resize 512x512 build/icon.png
echo "✓ Generated 512x512 icon.png"

echo ""
echo "Icon generated! For better quality, use a design tool or download from:"
echo "  - https://www.figma.com/community/file/1144686132055599907"
echo "  - https://iconscout.com/"
echo "  - https://www.flaticon.com/"
