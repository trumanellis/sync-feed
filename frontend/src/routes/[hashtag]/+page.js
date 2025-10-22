import { error } from '@sveltejs/kit';

const API_URL = 'http://localhost:3000';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
    const { hashtag } = params;

    try {
        // Fetch all possible content sources in parallel
        const [articlesRes, hashtagsRes, htmlContentRes, markdownContentRes] = await Promise.all([
            fetch(`${API_URL}/api/articles`),
            fetch(`${API_URL}/api/hashtags`),
            fetch(`${API_URL}/api/html-content/${hashtag}`),
            fetch(`${API_URL}/api/markdown-content/${hashtag}`)
        ]);

        // Parse responses - don't fail if optional content is missing
        const articlesData = articlesRes.ok ? await articlesRes.json() : [];
        const hashtagsData = hashtagsRes.ok ? await hashtagsRes.json() : [];
        const htmlContent = htmlContentRes.ok ? await htmlContentRes.json() : null;
        const markdownContent = markdownContentRes.ok ? await markdownContentRes.json() : null;

        // Check if ANY content exists for this hashtag
        const hasArticles = articlesData.some(article => article.hashtags.includes(hashtag));
        const hasHtml = htmlContent && htmlContent.content;
        const hasMarkdown = markdownContent && markdownContent.content;

        // If no content exists at all, throw 404
        if (!hasArticles && !hasHtml && !hasMarkdown) {
            throw error(404, {
                message: `Topic "${hashtag}" not found - no content available`
            });
        }

        // Filter articles for this specific hashtag
        const filteredArticles = articlesData.filter(article =>
            article.hashtags.includes(hashtag)
        );

        return {
            hashtag,
            articles: filteredArticles,
            allHashtags: hashtagsData,
            allArticles: articlesData,
            htmlContent: htmlContent?.content || null,
            markdownContent: markdownContent?.content || null
        };
    } catch (err) {
        if (err.status === 404) {
            throw err;
        }
        throw error(500, {
            message: 'Failed to load topic data'
        });
    }
}
