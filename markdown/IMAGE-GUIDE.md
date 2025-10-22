# Using Images in Topic Introductions

This guide explains how to add images to your topic introduction markdown files.

## Image Storage

All images should be stored in the central public images directory:
```
public/images/
```

This directory serves all images for:
- Topic introduction markdown files
- Site logos and branding
- Any other static images

## Image Paths in Markdown

When referencing images in your markdown files, use **relative paths**:

```html
<!-- ✅ CORRECT -->
<img src="images/your-image.png" alt="Description">

<!-- ✅ ALSO CORRECT -->
<img src="./images/your-image.png" alt="Description">

<!-- ❌ WRONG - Don't use absolute paths -->
<img src="/markdown/images/your-image.png" alt="Description">

<!-- ❌ WRONG - Don't use HTTP URLs for local images -->
<img src="http://localhost:3000/images/your-image.png" alt="Description">
```

**Why relative paths?**
The backend server automatically converts `images/` paths to the correct API URL, so your markdown files stay portable and clean.

## Adding Images to Cards

### Basic Image Card

```html
<div class="md-card-image">
<img src="images/my-photo.png" alt="My photo description">
<div class="md-card-image-content">
<div class="md-card-image-title">Card Title</div>
<div class="md-card-image-text">Card description text</div>
</div>
</div>
```

### Image Card Grid

```html
<div class="md-card-grid-3">

<div class="md-card-image">
<img src="images/photo1.png" alt="First photo">
<div class="md-card-image-content">
<div class="md-card-image-title">First Card</div>
<div class="md-card-image-text">Description...</div>
</div>
</div>

<div class="md-card-image">
<img src="images/photo2.png" alt="Second photo">
<div class="md-card-image-content">
<div class="md-card-image-title">Second Card</div>
<div class="md-card-image-text">Description...</div>
</div>
</div>

<div class="md-card-image">
<img src="images/photo3.png" alt="Third photo">
<div class="md-card-image-content">
<div class="md-card-image-title">Third Card</div>
<div class="md-card-image-text">Description...</div>
</div>
</div>

</div>
```

## Image File Formats

Supported formats:
- **.png** - Best for illustrations, icons, transparency
- **.jpg** / **.jpeg** - Best for photos
- **.gif** - For simple animations
- **.webp** - Modern format, good compression

## Image Naming Best Practices

1. **Use descriptive names**: `sacred-mountain.png` not `img001.png`
2. **No spaces**: Use `_` or `-` instead of spaces
3. **Lowercase**: `water-flow.png` not `Water-Flow.PNG`
4. **Keep it short**: Long filenames can cause issues

### Good Examples
- `odin-meditation.png`
- `sacred_vault.png`
- `intention-seed.png`

### Bad Examples
- `My Photo with Spaces.png` (spaces)
- `IMG_20231015_153045.png` (unclear)
- `PHOTO.PNG` (too generic)

## Image Size Recommendations

- **Width**: At least 800px wide for quality display
- **File size**: Keep under 2MB for fast loading
- **Aspect ratio**: 16:9 or 4:3 work well for cards

## Checking Your Images

After adding images to `public/images/`, verify they're accessible:

1. Start the backend server
2. Visit: `http://localhost:3000/images/your-image.png`
3. You should see your image

If the image doesn't load:
- Check the filename matches exactly (case-sensitive)
- Verify the file is in `public/images/` directory
- Ensure the file format is supported

## Real Example

Here's the SyncEngine.md example:

```html
# This is how you create Synchronicities:

<div class="md-card-grid-3">

<div class="md-card-image">
<img src="images/A_glowing_seed_or_spark_at_the_heart.png" alt="Glowing seed">
<div class="md-card-image-content">
<div class="md-card-image-title">Seeds of Intention</div>
<div class="md-card-image-text">1. Set your **Intention**, and share it with your community.</div>
</div>
</div>

<!-- More cards... -->

</div>
```

## Troubleshooting

**Problem**: Image shows broken icon in browser

**Solution**:
1. Check filename spelling in markdown matches actual file
2. Verify file is in `public/images/` directory
3. Make sure path starts with `images/` (not `public/images/`)
4. Restart backend server if you just added the image

**Problem**: Image loads but looks pixelated

**Solution**:
- Use higher resolution image (at least 800px wide)
- Try PNG format for sharper images
- Reduce image size without losing too much quality

**Problem**: Image takes too long to load

**Solution**:
- Compress the image (use online tools)
- Convert to WebP format for better compression
- Target 500KB - 1MB file size for good balance

## External Images

You can also use external image URLs:

```html
<img src="https://images.unsplash.com/photo-xxxxx?w=800&q=80" alt="Description">
```

**When to use external images:**
- Testing layouts before adding local images
- Using stock photos from Unsplash/Pexels
- Referencing web content

**When to use local images:**
- Your own photos/artwork
- Images you want full control over
- Content that won't change URLs

---

**Quick Reference**:
- Image directory: `public/images/`
- Image path in markdown: `images/filename.png`
- Test image: `http://localhost:3000/images/filename.png`

## Directory Structure

Your project structure for images:
```
sync-feed/
├── public/
│   └── images/          ← Store ALL images here
│       ├── logo.png     ← Site logo
│       ├── feature1.jpg ← Topic intro images
│       └── banner.png   ← Any other images
├── markdown/
│   ├── AguaLila.md     ← References images/feature1.jpg
│   └── SyncEngine.md
└── backend/
    └── src/
        └── server.js    ← Serves public/images/ at /images route
```
