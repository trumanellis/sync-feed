<script context="module">
  import EmbedCard from '$lib/components/cards/EmbedCard.svelte';

  export const meta = {
    title: 'Components/Cards/EmbedCard',
    component: EmbedCard,
    tags: ['autodocs']
  };
</script>

<script>
  import { Story } from '@storybook/addon-svelte-csf';

  const youtubeEmbed = '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';

  const spotifyEmbed = '<iframe style="border-radius: 12px" width="100%" height="152" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" src="https://open.spotify.com/embed/track/3n3Ppam7vgaVa1iaRUc9Lp"></iframe>';
</script>

<Story
  name="YouTube Video"
  args={{
    provider: 'YouTube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedHtml: youtubeEmbed,
    caption: 'Rick Astley - Never Gonna Give You Up (Official Video)',
    error: false
  }}
>
  {#snippet children(args)}
    <EmbedCard {...args} />
  {/snippet}
</Story>

<Story
  name="Spotify Track"
  args={{
    provider: 'Spotify',
    url: 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',
    embedHtml: spotifyEmbed,
    caption: 'Mr. Brightside - The Killers',
    error: false
  }}
>
  {#snippet children(args)}
    <EmbedCard {...args} />
  {/snippet}
</Story>

<Story
  name="Error State"
  args={{
    provider: 'unknown',
    url: 'https://example.com/unavailable',
    embedHtml: '',
    caption: '',
    error: true
  }}
>
  {#snippet children(args)}
    <EmbedCard {...args} />
  {/snippet}
</Story>

<Story
  name="No Caption"
  args={{
    provider: 'YouTube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedHtml: youtubeEmbed,
    caption: '',
    error: false
  }}
>
  {#snippet children(args)}
    <EmbedCard {...args} />
  {/snippet}
</Story>
