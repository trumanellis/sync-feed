# Public Images Directory

This directory contains all static images for the Synchronicity Engine application.

## What Goes Here

- **Site branding**: Logo, favicon, etc.
- **Topic introduction images**: Images referenced in markdown files
- **UI assets**: Any other static images needed by the site

## How to Use

1. **Add images**: Simply place image files in this directory
2. **Reference in markdown**: Use `images/filename.png` in your markdown files
3. **Reference in HTML**: Use `http://localhost:3000/images/filename.png`

## Image Requirements

- **Formats**: PNG, JPG, JPEG, GIF, WebP
- **Size**: Keep under 2MB for optimal loading
- **Naming**: Use lowercase with hyphens (e.g., `my-image.png`)
- **Resolution**: At least 800px wide for quality display

## Current Images

- `SeedsOfIntention.png` - Topic intro card
- `EyesOnGaia.png` - Topic intro card
- `Manifestation.png` - Topic intro card
- `SharedResourceVaults.png` - Topic intro card
- `TokenOfGratitude.png` - Topic intro card
- `SpiralOfGiving.png` - Topic intro card
- `LawOfReturn.png` - Topic intro card

## Server Configuration

Images are served by Express static middleware in `backend/src/server.js`:
```javascript
app.use('/images', express.static(path.join(publicPath, 'images')));
```

This makes all images accessible at `http://localhost:3000/images/[filename]`
