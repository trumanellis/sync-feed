<script>
    import { onMount } from 'svelte';
    import { articles, allHashtags, isLoading, hashtagIntro } from '$lib/stores/articles';
    import { fetchArticles, fetchHashtags } from '$lib/utils/api';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import TopicIntro from '$lib/components/TopicIntro.svelte';
    import ArticleGrid from '$lib/components/ArticleGrid.svelte';

    onMount(async () => {
        try {
            isLoading.set(true);
            const [articlesData, hashtagsData] = await Promise.all([
                fetchArticles(),
                fetchHashtags()
            ]);
            articles.set(articlesData);
            allHashtags.set(hashtagsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            isLoading.set(false);
        }
    });
</script>

<svelte:head>
    <title>Synchronicity Engine - Aeon Myths Gallery</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Exo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<div class="app-container">
    <Sidebar />
    <main class="main-content">
        <TopicIntro />
        <ArticleGrid />
    </main>
</div>