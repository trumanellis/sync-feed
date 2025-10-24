const API_URL = 'http://localhost:3000';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
    try {
        // Fetch all content sources in parallel (use 'index' as the hashtag name)
        const [articlesRes, hashtagsRes, htmlContentRes, markdownContentRes] = await Promise.all([
            fetch(`${API_URL}/api/articles`),
            fetch(`${API_URL}/api/hashtags`),
            fetch(`${API_URL}/api/html-content/index`),
            fetch(`${API_URL}/api/markdown-content/index`)
        ]);

        // Parse responses
        const articlesData = articlesRes.ok ? await articlesRes.json() : [];
        const hashtagsData = hashtagsRes.ok ? await hashtagsRes.json() : [];
        const htmlContent = htmlContentRes.ok ? await htmlContentRes.json() : null;
        const markdownContent = markdownContentRes.ok ? await markdownContentRes.json() : null;

        return {
            allArticles: articlesData,
            allHashtags: hashtagsData,
            htmlContent: htmlContent?.content || null,
            markdownContent: markdownContent?.content || null
        };
    } catch (err) {
        console.error('Failed to load homepage data:', err);
        return {
            allArticles: [],
            allHashtags: [],
            htmlContent: null,
            markdownContent: null
        };
    }
}
