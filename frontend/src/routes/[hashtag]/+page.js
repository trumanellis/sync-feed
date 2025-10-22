import { error } from '@sveltejs/kit';
import { fetchArticles, fetchHashtags, fetchHashtagIntro } from '$lib/utils/api';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    const { hashtag } = params;

    try {
        // Fetch all data in parallel
        const [articlesData, hashtagsData, hashtagIntroData] = await Promise.all([
            fetchArticles(),
            fetchHashtags(),
            fetchHashtagIntro(hashtag)
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
