<script>
    import { goto } from '$app/navigation';
    import { selectedTag, allHashtags, hashtagCounts, articles, filteredArticles } from '$lib/stores/articles';
    import { formatHashtag } from '$lib/utils/formatters';

    function handleTagClick(tag) {
        if (tag === 'all') {
            goto('/');
        } else {
            goto(`/${tag}`);
        }
    }
</script>

<aside class="sidebar">
    <!-- Logo -->
    <!-- <div class="logo-container">
        <div class="logo flex items-center justify-center cursor-pointer" on:click={() => handleTagClick('all')}>
            <img src="/images/glowing-eye.png" alt="Synchronicity Engine" class="w-full h-full object-contain" />
        </div>
        <h2 class="text-xl font-bold text-center cursor-pointer" style="color: rgb(var(--color-gold)); text-shadow: 0 0 15px rgb(var(--color-gold-rgb) / 0.6);" on:click={() => handleTagClick('all')}>
            Synchronicity Engine
        </h2>
    </div> -->
    <div class="logo-container">
        <div class="logo-placeholder"></div>
    </div>

    <!-- Hashtag filters -->
    <div class="sidebar-section" style="border-top: 1px solid rgb(var(--color-gold-rgb) / 0.3);">
        {#each $allHashtags as tag}
            <button
                on:click={() => handleTagClick(tag)}
                class="nav-link {$selectedTag === tag ? 'nav-link--active' : ''} text-sm"
            >
                {formatHashtag(tag)}
            </button>
        {/each}
    </div>
</aside>

<style>
    .sidebar {
        flex-shrink: 0;
        width: 233px;        /* Fibonacci number */
        background: transparent;
        backdrop-filter: blur(8px);
        border-right: 1px solid rgb(var(--color-gold-rgb) / 0.3);
        box-shadow: 4px 0 30px rgb(var(--color-gold-rgb) / 0.15);
        overflow-y: auto;
        position: sticky;
        top: 0;
        height: 100vh;
    }

    .logo-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 34px 21px;  /* Fibonacci: 34px top/bottom, 21px left/right */
        border-bottom: 1px solid rgb(var(--color-gold-rgb) / 0.3);
    }

    .logo {
        width: 89px;         /* Fibonacci number */
        height: 89px;        /* Fibonacci number */
        margin-bottom: 21px; /* Fibonacci number */
    }

    .logo-placeholder {
        width: 89px;         /* Fibonacci number */
        height: 89px;        /* Fibonacci number */
        background: transparent;
    }

    .sidebar-section {
        padding: 1.5rem 1rem;
    }

    /* Responsive styles */
    @media (max-width: 1024px) {
        .sidebar {
            width: 100%;
            height: auto;
            position: sticky;
            top: 0;
            z-index: 999;
            border-right: none;
            border-bottom: 1px solid rgb(var(--color-gold-rgb) / 0.3);
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0.75rem 1rem;
            gap: 1.5rem;
        }

        .logo-container {
            padding: 0;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            gap: 0.75rem;
            border-bottom: none;
            flex-shrink: 0;
        }

        .logo {
            width: 50px;
            height: 50px;
            margin-bottom: 0;
        }

        .logo-container :global(h2) {
            font-size: 1rem;
            text-align: left;
            margin: 0;
        }

        .sidebar-section {
            padding: 0;
            border-top: none !important;
            display: flex;
            flex-direction: row;
            gap: 0.5rem;
            align-items: center;
            overflow-x: auto;
            flex: 1;
        }

        .sidebar-section :global(button) {
            transform: none !important;
            width: auto;
            white-space: nowrap;
            padding: 0.5rem 1rem !important;
            margin-bottom: 0;
            font-size: 0.875rem;
        }
    }

    /* Mobile phone specific */
    @media (max-width: 640px) {
        .sidebar {
            gap: 0.75rem;
            padding: 0.5rem 0.75rem;
        }

        .logo {
            width: 40px;
            height: 40px;
        }

        .logo-container :global(h2) {
            font-size: 0.875rem;
        }

        .sidebar-section :global(button) {
            padding: 0.4rem 0.75rem !important;
            font-size: 0.75rem;
        }
    }
</style>
