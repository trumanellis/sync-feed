<script>
    export let tag;
    export let variant = 'default'; // 'default', 'active', 'outline'
    export let size = 'md'; // 'sm', 'md', 'lg'
</script>

<span class="hashtag-badge {variant} {size}">
    #{tag}
</span>

<style>
    .hashtag-badge {
        display: inline-flex;
        align-items: center;
        font-weight: 500;
        border-radius: 0.25rem;
        transition: all 0.2s ease;
        backdrop-filter: blur(4px);
    }

    /* Sizes */
    .hashtag-badge.sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
    }

    .hashtag-badge.md {
        padding: 0.35rem 0.75rem;
        font-size: 0.875rem;
    }

    .hashtag-badge.lg {
        padding: 0.5rem 1rem;
        font-size: 1rem;
    }

    /* Variants */
    .hashtag-badge.default {
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid rgba(212, 175, 55, 0.4);
        color: #F7F3E9;
    }

    .hashtag-badge.default:hover {
        background: rgba(0, 0, 0, 0.85);
        border-color: rgba(212, 175, 55, 0.6);
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
    }

    .hashtag-badge.active {
        background: rgba(212, 175, 55, 0.3);
        border: 1px solid rgba(212, 175, 55, 0.6);
        color: #D4AF37;
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
    }

    .hashtag-badge.outline {
        background: transparent;
        border: 1px solid rgba(212, 175, 55, 0.4);
        color: #84A98C;
    }

    .hashtag-badge.outline:hover {
        border-color: rgba(212, 175, 55, 0.6);
        color: #D4AF37;
        text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    }
</style>
