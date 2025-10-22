<script>
    import { hashtagIntro } from '$lib/stores/articles';
</script>

{#if $hashtagIntro && $hashtagIntro.exists}
    <div class="topic-intro">
        {@html $hashtagIntro.html}
    </div>
{/if}
