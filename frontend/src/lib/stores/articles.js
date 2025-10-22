import { writable, derived } from 'svelte/store';

// State stores
export const articles = writable([]);
export const allHashtags = writable([]);
export const selectedTag = writable('all');
export const searchTerm = writable('');
export const isLoading = writable(true);
export const hashtagIntro = writable(null);

// Derived store for filtered articles
export const filteredArticles = derived(
    [articles, selectedTag, searchTerm],
    ([$articles, $selectedTag, $searchTerm]) => {
        return $articles.filter(article => {
            const matchesTag = $selectedTag === 'all' || article.hashtags.includes($selectedTag);
            const matchesSearch = $searchTerm === '' ||
                article.title.toLowerCase().includes($searchTerm.toLowerCase()) ||
                article.subtitle.toLowerCase().includes($searchTerm.toLowerCase());
            return matchesTag && matchesSearch;
        });
    }
);

// Derived store for article count by hashtag
export const hashtagCounts = derived(
    articles,
    ($articles) => {
        const counts = {};
        $articles.forEach(article => {
            article.hashtags.forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        return counts;
    }
);
