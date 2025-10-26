<script>
    export let provider = 'unknown';
    export let url = '';
    export let embedHtml = '';
    export let caption = '';
    export let error = false;
</script>

{#if error}
    <div class="embed-error">
        <p>Unable to embed: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
    </div>
{:else}
    <div class="embed-container" data-provider={provider} data-url={url}>
        <div class="embed-wrapper">
            {@html embedHtml}
        </div>
        {#if caption}
            <div class="embed-caption">{caption}</div>
        {/if}
    </div>
{/if}

<style>
    /* Styles are already in markdown.css, but we include them here for Storybook isolation */
    .embed-container {
        position: relative;
        background: rgba(45, 106, 79, 0.4);
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 0.75rem;
        padding: 0;
        margin: 2rem 0;
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .embed-container:hover {
        transform: translateY(-8px);
        border-color: rgba(212, 175, 55, 0.6);
        box-shadow: 0 0 40px rgba(212, 175, 55, 0.3),
                    0 0 60px rgba(132, 169, 140, 0.2),
                    0 20px 40px rgba(0, 0, 0, 0.6);
    }

    .embed-wrapper {
        position: relative;
        width: 100%;
        padding-top: 61.8%; /* Golden ratio: height = width / 1.618 */
        overflow: hidden;
        background: #000;
        flex: 1.618;
    }

    .embed-wrapper :global(iframe) {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        display: block;
    }

    .embed-caption {
        padding: 1.25rem;
        color: #84A98C;
        font-size: 0.95rem;
        font-weight: 500;
        text-align: left;
        border-top: 1px solid rgba(212, 175, 55, 0.3);
        flex: 1;
        display: flex;
        align-items: center;
    }

    .embed-error {
        background: rgba(45, 106, 79, 0.4);
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin: 2rem 0;
        color: #F7F3E9;
        text-align: center;
        backdrop-filter: blur(4px);
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
        transition: all 0.3s ease;
    }

    .embed-error:hover {
        transform: translateY(-4px);
        border-color: rgba(212, 175, 55, 0.5);
        box-shadow: 0 0 30px rgba(212, 175, 55, 0.2),
                    0 0 50px rgba(132, 169, 140, 0.15);
    }

    .embed-error a {
        color: #D4AF37;
        text-decoration: none;
        font-weight: 600;
        text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        transition: all 0.2s ease;
    }

    .embed-error a:hover {
        color: #F4B942;
        text-shadow: 0 0 20px rgba(244, 185, 66, 0.8);
    }

    .embed-container[data-provider]::before {
        content: attr(data-provider);
        position: absolute;
        top: 0.75rem;
        left: 0.75rem;
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid rgba(212, 175, 55, 0.4);
        color: #F7F3E9;
        padding: 0.35rem 0.85rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
        z-index: 10;
        backdrop-filter: blur(4px);
        transition: all 0.3s ease;
    }

    .embed-container:hover[data-provider]::before {
        background: rgba(0, 0, 0, 0.85);
        border-color: rgba(212, 175, 55, 0.6);
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
    }
</style>
