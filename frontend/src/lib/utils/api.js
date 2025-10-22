// API client for backend communication
const API_URL = '/api';

/**
 * Fetch all articles from the backend
 */
export async function fetchArticles() {
    try {
        const response = await fetch(`${API_URL}/articles`);
        if (!response.ok) {
            throw new Error(`Failed to fetch articles: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching articles:', error);
        throw error;
    }
}

/**
 * Fetch all hashtags from the backend
 */
export async function fetchHashtags() {
    try {
        const response = await fetch(`${API_URL}/hashtags`);
        if (!response.ok) {
            throw new Error(`Failed to fetch hashtags: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching hashtags:', error);
        throw error;
    }
}

/**
 * Fetch topic introduction markdown for a specific hashtag
 */
export async function fetchHashtagIntro(hashtag) {
    if (hashtag === 'all') {
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/hashtag-intro/${hashtag}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch hashtag intro: ${response.statusText}`);
        }
        const data = await response.json();
        return data.exists ? data : null;
    } catch (error) {
        console.error('Error fetching hashtag intro:', error);
        return null;
    }
}

/**
 * Trigger manual sync with Substack
 */
export async function triggerSync() {
    try {
        const response = await fetch(`${API_URL}/sync`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error(`Failed to trigger sync: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error triggering sync:', error);
        throw error;
    }
}
