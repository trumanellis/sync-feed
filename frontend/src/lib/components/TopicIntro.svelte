<script>
    import { hashtagIntro } from '$lib/stores/articles';
</script>

{#if $hashtagIntro && $hashtagIntro.exists}
    <div class="topic-intro">
        {#if $hashtagIntro.htmlFile}
            <div class="topic-html">
                {@html $hashtagIntro.htmlFile}
            </div>
        {/if}
        {#if $hashtagIntro.html}
            <div class="topic-markdown">
                {@html $hashtagIntro.html}
            </div>
        {/if}
    </div>
{/if}
