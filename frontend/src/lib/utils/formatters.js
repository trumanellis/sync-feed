/**
 * Truncate text preview to a specific number of sentences
 */
export function truncatePreview(text, sentences = 2) {
    const sentenceArray = text.split(/[.!?]+\s/);
    return sentenceArray.slice(0, sentences).join('. ') + (sentenceArray.length > sentences ? '...' : '');
}

/**
 * Format date to readable format
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Convert snake_case or PascalCase hashtags to readable format
 */
export function formatHashtag(tag) {
    // Insert space before capital letters and return
    return tag.replace(/([A-Z])/g, ' $1').trim();
}
