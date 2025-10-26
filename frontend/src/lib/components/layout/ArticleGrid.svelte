<script>
    import { filteredArticles, isLoading } from '$lib/stores/articles';
    import ArticleCard from '$lib/components/cards/ArticleCard.svelte';
</script>

{#if $isLoading}
    <div class="text-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style="border-color: #D4AF37;"></div>
        <p class="text-gray-400 text-lg">Loading articles from Substack...</p>
    </div>
{:else if $filteredArticles.length === 0}
    <div class="text-center py-20">
        <p class="text-gray-400 text-lg">No articles found matching your criteria.</p>
    </div>
{:else}
    <h2 class="text-2xl font-bold mb-6 pt-8" style="color: #D4AF37; text-shadow: 0 0 15px rgba(212, 175, 55, 0.6);">
        Further Reading
    </h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {#each $filteredArticles as article (article.substackUrl)}
            <ArticleCard {article} />
        {/each}
    </div>
{/if}
