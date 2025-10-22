# Hashtag Topic Introductions

This directory contains markdown files that serve as introductions to specific topic hashtags in the Synchronicity Engine gallery.

## How It Works

1. **Create a Markdown File**: Name the file exactly as the hashtag appears (e.g., `AguaLila.md` for #AguaLila)
2. **Add Content**: Write your topic introduction using standard markdown
3. **Automatic Display**: When users click on that hashtag in the gallery, your introduction will appear above the articles

## File Naming Convention

- **Match the hashtag exactly**: If the hashtag is `#TemplesOfRefuge`, name the file `TemplesOfRefuge.md`
- **CamelCase**: Use the same capitalization as your hashtag
- **No special characters**: Only use letters and numbers in filenames

## Example

For the hashtag `#AguaLila`, create a file called `AguaLila.md`:

```markdown
# Agua Lila: The Purple Waters

**Agua Lila** represents a mystical exploration of liminal spaces...

## Key Themes

- Sacred Fluidity
- Transformation
- Mystery
```

## Styling

The markdown content is automatically styled to match the site's neon nature theme:

- **Headings**: Golden glow effect
- **Text**: Light cream color with good readability
- **Links**: Golden with hover effects
- **Blockquotes**: Italicized with green accent border
- **Code**: Dark background with golden text

## Supported Markdown Features

All standard markdown features are supported:

- Headers (H1-H6)
- **Bold** and *italic* text
- [Links](https://example.com)
- Lists (ordered and unordered)
- > Blockquotes
- `Inline code` and code blocks
- Horizontal rules

### ✨ Card-Style Components

You can also use special card-style layouts within your markdown:

- **Cards**: Bordered boxes with hover effects
- **Card Grids**: 2 or 3 column responsive layouts
- **Badges**: Small tags for categorization
- **Notice Boxes**: Highlighted info or warning sections
- **Icons**: Large emojis for visual interest

📚 **See [CARD-STYLING-GUIDE.md](./CARD-STYLING-GUIDE.md)** for complete documentation

🎨 **Examples**:
- [CardExamples.md](./CardExamples.md) - Text cards with icons
- [ImageCardExamples.md](./ImageCardExamples.md) - Cards with images

## Graceful Degradation

If no markdown file exists for a hashtag:
- The site continues to work normally
- No error messages are shown
- The gallery displays articles as usual
- Users can still filter by that hashtag

## API Endpoint

Backend endpoint: `GET /api/hashtag-intro/:hashtag`

Returns:
```json
{
  "exists": true,
  "hashtag": "AguaLila",
  "markdown": "...",
  "html": "..."
}
```

Or if not found:
```json
{
  "exists": false,
  "hashtag": "NonExistent"
}
```
