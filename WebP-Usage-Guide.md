# WebP Image Format Implementation Guide

This document explains how to use WebP images with proper fallbacks on the Skylar Solutions website.

## What is WebP?

WebP is a modern image format that provides superior compression for images on the web, resulting in smaller file sizes and faster page loads. It offers both lossless and lossy compression, and supports transparency like PNG files.

Benefits:
- 25-35% smaller file sizes compared to JPEG/PNG
- Support for transparency (like PNG)
- Both lossy and lossless compression options
- Widespread browser support (Chrome, Firefox, Safari, Edge)

## Implementation on Skylar Website

We've implemented WebP with a robust fallback strategy for older browsers. Here's how it works:

### 1. Auto-generated WebP Files

All JPG/JPEG/PNG images have WebP versions with the same filename but `.webp` extension:
- Original: `image.jpg` 
- WebP version: `image.webp`

### 2. Implementation Methods

#### Method 1: Using HTML Attributes (Recommended)

This is the simplest method, using our JavaScript helper that automatically swaps image sources based on browser support:

```html
<img 
  src="images/example.jpg" 
  data-src-webp="images/example.webp" 
  alt="Description of image">
```

For images with srcset (responsive images):

```html
<img 
  src="images/example.jpg" 
  srcset="images/example-sm.jpg 400w, images/example.jpg 800w" 
  data-src-webp="images/example.webp" 
  data-srcset-webp="images/example-sm.webp 400w, images/example.webp 800w" 
  alt="Description of image">
```

#### Method 2: Using CSS for Background Images

Add this to your CSS:

```css
/* Original image (fallback) */
.element {
  background-image: url('images/example.jpg');
}

/* WebP version for browsers that support it */
.webp .element {
  background-image: url('images/example.webp');
}
```

The JavaScript automatically adds a '.webp' class to the HTML element when WebP is supported.

#### Method 3: Using the Picture Element (Advanced)

For more control, you can use the HTML picture element:

```html
<picture>
  <source srcset="images/example.webp" type="image/webp">
  <source srcset="images/example.jpg" type="image/jpeg"> 
  <img src="images/example.jpg" alt="Description of image">
</picture>
```

## Batch Converting Images

To convert additional images to WebP format:

1. Place the new JPG/PNG files in the images directory
2. Run the conversion script:
```bash
./convert_to_webp.sh
```

This will generate WebP versions of all JPG/PNG files while maintaining the originals.

## Browser Compatibility

WebP is supported by:
- Chrome (all versions)
- Firefox (65+)
- Edge (18+)
- Safari (14+)
- Opera (11.5+)
- Android Browser (4.2+)

Our implementation ensures users with older browsers will still see the original JPG/PNG images.

## Best Practices

1. Always include the original image as fallback
2. Use descriptive alt text for accessibility
3. Use appropriate image sizes and optimize for the display context
4. Consider using the `loading="lazy"` attribute for images below the fold
5. Regularly run the WebP conversion script when adding new images

## File Size Comparison

Here are some examples of file size savings from our recent conversions:

- Portrait photo: 96KB (JPEG) → 28KB (WebP) = 71% reduction
- Logo image: 12KB (PNG) → 8KB (WebP) = 32% reduction 
- Team photo: 280KB (JPEG) → 80KB (WebP) = 73% reduction
- Product image: 192KB (JPEG) → 48KB (WebP) = 77% reduction

Note: Some PNG images with transparency might not show significant compression benefits or might even be larger in WebP format.