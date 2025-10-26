<script>
    import Sidebar from '$lib/components/Sidebar.svelte';
    import ArticleGrid from '$lib/components/ArticleGrid.svelte';
    import { articles, allHashtags, selectedTag, isLoading } from '$lib/stores/articles';

    /** @type {import('./$types').PageData} */
    export let data;

    // Reactively update stores whenever data changes
    $: {
        isLoading.set(false);
        articles.set(data.allArticles);
        allHashtags.set(data.allHashtags);
        selectedTag.set('all');
    }
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
        <!-- Render HTML content if available -->
        {#if data.htmlContent}
            <div class="html-content topic-html">
                {@html data.htmlContent}
            </div>
        {/if}

        <!-- Render markdown content if available -->
        {#if data.markdownContent}
            <div class="markdown-content topic-intro">
                {@html data.markdownContent}
            </div>
        {/if}

        <!-- Render article grid -->
        <div class="article-grid-section">
            <ArticleGrid />
        </div>
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

    .article-grid-section {
        padding-top: 3rem;
    }
</style>