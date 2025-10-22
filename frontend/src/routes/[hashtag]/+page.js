import { error } from '@sveltejs/kit';

const API_URL = 'http://localhost:3000';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
    const { hashtag } = params;

    try {
        // Fetch all data in parallel using absolute URLs
        const [articlesRes, hashtagsRes, hashtagIntroRes] = await Promise.all([
            fetch(`${API_URL}/api/articles`),
            fetch(`${API_URL}/api/hashtags`),
            fetch(`${API_URL}/api/hashtag-intro/${hashtag}`)
        ]);

        if (!articlesRes.ok || !hashtagsRes.ok || !hashtagIntroRes.ok) {
            throw error(500, {
                message: 'Failed to fetch data from API'
            });
        }

        const [articlesData, hashtagsData, hashtagIntroData] = await Promise.all([
            articlesRes.json(),
            hashtagsRes.json(),
            hashtagIntroRes.json()
        ]);

        // Check if the hashtag exists
        if (!hashtagsData.includes(hashtag)) {
            throw error(404, {
                message: `Topic "${hashtag}" not found`
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
            hashtagIntro: hashtagIntroData,
            allArticles: articlesData
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
