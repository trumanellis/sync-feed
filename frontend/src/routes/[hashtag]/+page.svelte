<script>
    import Sidebar from '$lib/components/Sidebar.svelte';
    import TopicIntro from '$lib/components/TopicIntro.svelte';
    import ArticleGrid from '$lib/components/ArticleGrid.svelte';
    import { articles, allHashtags, selectedTag, hashtagIntro } from '$lib/stores/articles';
    import { formatHashtag } from '$lib/utils/formatters';

    /** @type {import('./$types').PageData} */
    export let data;

    // Reactively update stores whenever data changes (on navigation)
    $: {
        articles.set(data.allArticles);
        allHashtags.set(data.allHashtags);
        selectedTag.set(data.hashtag);
        hashtagIntro.set(data.hashtagIntro);
    }
</script>

<svelte:head>
    <title>{formatHashtag(data.hashtag)} - Synchronicity Engine</title>
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
