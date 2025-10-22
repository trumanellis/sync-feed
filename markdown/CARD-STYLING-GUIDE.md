# Card Styling Guide for Markdown Topic Introductions

This guide shows you how to create beautiful card-style layouts within your topic introduction markdown files.

## Quick Reference

| Class | Purpose |
|-------|---------|
| `md-card` | Basic card with border and shadow |
| `md-card-highlight` | Featured card with golden accent |
| `md-card-subtle` | Subtle, low-contrast card |
| `md-card-image` | Card with image on top, text below |
| `md-card-image-tall` | Taller image (280px height) |
| `md-card-image-short` | Shorter image (150px height) |
| `md-card-image-overlay` | Image with gradient overlay |
| `md-card-grid` | Grid layout (auto-sizing) |
| `md-card-grid-2` | 2-column grid |
| `md-card-grid-3` | 3-column grid |
| `md-card-title` | Card heading |
| `md-card-text` | Card body text |
| `md-card-icon` | Large icon at top of card |
| `md-card-image-title` | Title in image card |
| `md-card-image-text` | Text in image card |
| `md-card-image-link` | Link in image card |
| `md-card-image-caption` | Caption overlay on image |
| `md-badge` | Small tag/label |
| `md-notice` | Info box with green border |
| `md-notice-warning` | Warning box with golden border |

---

## Basic Card

```html
<div class="md-card">
<div class="md-card-title">Card Title</div>
<div class="md-card-text">Your content goes here.</div>
</div>
```

**Result**: A card with green/golden theme, subtle glow, and hover effect.

---

## Card with Icon

```html
<div class="md-card">
<div class="md-card-icon">🌟</div>
<div class="md-card-title">Featured Content</div>
<div class="md-card-text">Add emojis as icons for visual interest.</div>
</div>
```

**Tips for Icons**:
- Use emojis: 🌊 💧 ✨ 🌙 ⚡ 🔥 🌍 💨 🗺️ 🎯 📖 ⚠️
- Keep them relevant to your content
- One icon per card works best

---

## Grid Layouts

### Auto-sizing Grid (adapts to screen)

```html
<div class="md-card-grid">
<div class="md-card">
  <div class="md-card-title">Card 1</div>
  <div class="md-card-text">Content...</div>
</div>
<div class="md-card">
  <div class="md-card-title">Card 2</div>
  <div class="md-card-text">Content...</div>
</div>
</div>
```

### Three-Column Grid

```html
<div class="md-card-grid-3">
  <!-- 3 cards here -->
</div>
```

Best for: Feature lists, theme categories, quick overviews

### Two-Column Grid

```html
<div class="md-card-grid-2">
  <!-- 2 cards here -->
</div>
```

Best for: Before/after, compare/contrast, philosophy/practice pairs

---

## Card Variants

### Highlighted Card (Golden accent)

```html
<div class="md-card md-card-highlight">
<div class="md-card-title">🎯 Important Announcement</div>
<div class="md-card-text">This card stands out with enhanced golden styling.</div>
</div>
```

**Use for**: Featured content, announcements, key concepts

### Subtle Card (Low contrast)

```html
<div class="md-card md-card-subtle">
<div class="md-card-title">Background Info</div>
<div class="md-card-text">Less prominent, good for secondary content.</div>
</div>
```

**Use for**: Supporting information, related links, optional reading

---

## Badges

```html
<span class="md-badge">Tag One</span>
<span class="md-badge">Tag Two</span>
<span class="md-badge">Tag Three</span>
```

**Result**: Small golden pill-shaped tags

**Use for**: Categories, themes, keywords, status indicators

---

## Notice Boxes

### Info Notice (Green border)

```html
<div class="md-notice">
<strong>📖 Note:</strong> General information or helpful tips go here.
</div>
```

### Warning Notice (Golden border)

```html
<div class="md-notice md-notice-warning">
<strong>⚠️ Important:</strong> Critical information that needs attention.
</div>
```

**Tips**:
- Use sparingly for maximum impact
- Include an emoji for visual scanning
- Keep text concise

---

## Complete Example

```html
# My Topic Introduction

Here's some regular markdown text to introduce the topic.

<div class="md-card md-card-highlight">
<div class="md-card-title">🌟 What Makes This Special</div>
<div class="md-card-text">This topic explores unique intersections between nature and consciousness.</div>
</div>

## Key Themes

<div class="md-card-grid-3">
<div class="md-card">
<div class="md-card-icon">💧</div>
<div class="md-card-title">Fluidity</div>
<div class="md-card-text">Exploring change and adaptation.</div>
</div>

<div class="md-card">
<div class="md-card-icon">🌊</div>
<div class="md-card-title">Depth</div>
<div class="md-card-text">Diving beneath the surface.</div>
</div>

<div class="md-card">
<div class="md-card-icon">✨</div>
<div class="md-card-title">Mystery</div>
<div class="md-card-text">Embracing the unknown.</div>
</div>
</div>

## Topics Covered

<span class="md-badge">Philosophy</span>
<span class="md-badge">Nature</span>
<span class="md-badge">Spirituality</span>
<span class="md-badge">Practice</span>

<div class="md-notice">
<strong>📖 Reading Note:</strong> These articles build on each other. Start from the beginning for the full journey.
</div>

Regular markdown content continues here with paragraphs, lists, links, etc.
```

---

## Image Cards

### Basic Image Card

```html
<div class="md-card-image">
<div class="md-card-image-wrapper">
<img src="your-image-url.jpg" alt="Description">
<div class="md-card-image-title">Card Title</div>
</div>
<div class="md-card-image-content">
<div class="md-card-image-text">Your description text here.</div>
</div>
</div>
```

**Features**:
- Image on top (192px default height)
- **Title overlays the image** in the bottom left with gradient background
- Text content lives in separate panel below
- Hover effect lifts the entire card and changes title to golden
- Golden border with glow
- Dark gradient overlay on image for text readability

### Image Card Sizes

**Tall images** (420px):
```html
<div class="md-card-image md-card-image-tall">
```

**Short images** (240px):
```html
<div class="md-card-image md-card-image-short">
```

**Use tall for**: Hero images, featured content, portraits
**Use short for**: Galleries, quick previews, thumbnails

**All sizes follow the golden ratio** (φ ≈ 1.618) for harmonious visual balance between image and text.

### Image Card with Link

```html
<div class="md-card-image">
<img src="image.jpg" alt="Description">
<div class="md-card-image-content">
<div class="md-card-image-title">Article Title</div>
<div class="md-card-image-text">Preview text...</div>
<a href="https://your-link.com" class="md-card-image-link">Read More →</a>
</div>
</div>
```

### Image Card with Overlay Caption

```html
<div class="md-card-image">
<div class="md-card-image-overlay">
<img src="image.jpg" alt="Description">
<div class="md-card-image-caption">Photo credit or caption text</div>
</div>
<div class="md-card-image-content">
<div class="md-card-image-title">Title</div>
<div class="md-card-image-text">Content...</div>
</div>
</div>
```

The overlay creates a gradient at the bottom of the image, perfect for captions or credits.

### Image Card Grid Examples

**Three columns** (great for galleries):
```html
<div class="md-card-grid-3">
<div class="md-card-image">...</div>
<div class="md-card-image">...</div>
<div class="md-card-image">...</div>
</div>
```

**Two columns** (great for featured content):
```html
<div class="md-card-grid-2">
<div class="md-card-image md-card-image-tall">...</div>
<div class="md-card-image md-card-image-tall">...</div>
</div>
```

### Image Sources

- **Your Substack**: Use images from your articles
- **Unsplash**: `https://images.unsplash.com/photo-xxxxx?w=800&q=80`
- **Your CDN**: Upload to your own hosting
- **Public domain**: NASA, Wikimedia Commons, etc.

**Recommendation**: Use images at least 800px wide for quality

---

## Styling Details

All card components automatically inherit the site's **neon nature theme**:

- **Primary color**: Golden (#D4AF37) with glow effects
- **Secondary color**: Green (#84A98C)
- **Background**: Semi-transparent dark green
- **Borders**: Golden with varying opacity
- **Hover effects**: Lift and enhanced glow
- **Responsive**: Auto-adapts to mobile screens

---

## Best Practices

1. **Don't overuse**: Cards work best when highlighting key information
2. **Mix with regular markdown**: Use cards for visual structure, regular text for reading
3. **Icons add personality**: Choose meaningful emojis that relate to content
4. **Keep text concise**: Cards work best with 1-3 short paragraphs
5. **Test responsiveness**: View on mobile to ensure layouts work well

---

## Troubleshooting

**Cards not appearing?**
- Ensure you're using `<div>` tags (HTML within markdown)
- Check class names are spelled correctly (they're case-sensitive)
- Make sure closing `</div>` tags are present

**Layout looks broken?**
- Verify grid containers properly wrap all cards
- Check for unclosed tags
- Test with simpler layouts first

**Colors look wrong?**
- Styles are scoped to `.topic-intro` - they only work in topic intros
- Don't override styles; use provided variants instead

---

## Need More?

- See `markdown/CardExamples.md` for text card examples
- See `markdown/ImageCardExamples.md` for image card examples
- Check `markdown/AguaLila.md` for a real-world implementation
- View `frontend/src/frontend.html` (lines 205-375) for CSS source

The card system is designed to be simple yet powerful. Start with basic cards and gradually incorporate more advanced layouts as needed!
