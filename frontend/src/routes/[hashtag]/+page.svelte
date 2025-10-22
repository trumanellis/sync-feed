<script>
    import Sidebar from '$lib/components/Sidebar.svelte';
    import TopicIntro from '$lib/components/TopicIntro.svelte';
    import ArticleGrid from '$lib/components/ArticleGrid.svelte';
    import { articles, allHashtags, selectedTag, hashtagIntro, isLoading } from '$lib/stores/articles';
    import { formatHashtag } from '$lib/utils/formatters';

    /** @type {import('./$types').PageData} */
    export let data;

    // Reactively update stores whenever data changes (on navigation)
    $: {
        isLoading.set(false);
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
    <link rel="stylesheet" href="http://localhost:3000/styles/sacred-theme.css">
    <script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<div class="app-container">
    <Sidebar />
    <main class="main-content">
        <!-- Render HTML content if available -->
        {#if data.htmlContent}
            <div class="html-content">
                {@html data.htmlContent}
            </div>
        {/if}

        <!-- Render markdown content if available -->
        {#if data.markdownContent}
            <div class="markdown-content prose prose-invert max-w-none">
                {@html data.markdownContent}
            </div>
        {/if}

        <!-- Render topic intro if available -->
        {#if data.hashtagIntro}
            <TopicIntro />
        {/if}

        <!-- Render article grid if articles are available -->
        {#if data.articles && data.articles.length > 0}
            <ArticleGrid />
        {/if}

        <!-- Show message if no content at all -->
        {#if !data.htmlContent && !data.markdownContent && !data.hashtagIntro && (!data.articles || data.articles.length === 0)}
            <div class="no-content">
                <p>No content available for this topic yet.</p>
            </div>
        {/if}
    </main>
</div>

<style>
    .html-content {
        margin-bottom: 2rem;
    }

    .markdown-content {
        margin-bottom: 2rem;
        padding: 1rem;
    }

    .no-content {
        padding: 4rem 2rem;
        text-align: center;
        color: #84A98C;
    }
</style>
