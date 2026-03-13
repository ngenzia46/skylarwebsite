#!/bin/bash

# Script to convert JPG/JPEG/PNG images to WebP format
# This script maintains the original files and creates WebP versions alongside them

# Set quality (0-100, higher is better quality but larger file size)
QUALITY=80

# Ensure the images directory exists
if [ ! -d "images" ]; then
  echo "Error: images directory not found!"
  exit 1
fi

# Count of files processed
CONVERTED=0
SKIPPED=0
ERRORS=0

# Convert JPG/JPEG files
echo "Converting JPEG/JPG files..."
find "images" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r img; do
  # Get the base name without extension
  output_path="${img%.*}.webp"
  
  # Check if WebP already exists and is newer than the source
  if [ -f "$output_path" ] && [ "$output_path" -nt "$img" ]; then
    echo "Skipping $img (WebP version already exists and is up to date)"
    ((SKIPPED++))
  else
    echo "Converting $img to WebP..."
    if cwebp -quiet -mt -q $QUALITY "$img" -o "$output_path"; then
      echo "  Successfully created $output_path"
      ((CONVERTED++))
    else
      echo "  Error converting $img"
      ((ERRORS++))
    fi
  fi
done

# Convert PNG files
echo -e "\nConverting PNG files..."
find "images" -type f -iname "*.png" | while read -r img; do
  # Get the base name without extension
  output_path="${img%.*}.webp"
  
  # Check if WebP already exists and is newer than the source
  if [ -f "$output_path" ] && [ "$output_path" -nt "$img" ]; then
    echo "Skipping $img (WebP version already exists and is up to date)"
    ((SKIPPED++))
  else
    echo "Converting $img to WebP..."
    if cwebp -quiet -mt -q $QUALITY "$img" -o "$output_path"; then
      echo "  Successfully created $output_path"
      ((CONVERTED++))
    else
      echo "  Error converting $img"
      ((ERRORS++))
    fi
  fi
done

echo -e "\nConversion complete!"
echo "NOTE: Use the stats below to get an approximate count of processed files:"

# Check webp file sizes compared to originals
echo -e "\nFile size comparison (original vs WebP):"
find "images" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r img; do
  webp_version="${img%.*}.webp"
  if [ -f "$webp_version" ]; then
    original_size=$(du -h "$img" | cut -f1)
    webp_size=$(du -h "$webp_version" | cut -f1)
    percent_saved=$(echo "scale=2; (1 - $(stat -f %z "$webp_version") / $(stat -f %z "$img")) * 100" | bc)
    echo "$img ($original_size) -> $webp_version ($webp_size) - Saved: ${percent_saved}%"
  fi
done