<script context="module">
  import ArticleCard from '$lib/components/cards/ArticleCard.svelte';

  export const meta = {
    title: 'Components/Cards/ArticleCard',
    component: ArticleCard,
    tags: ['autodocs']
  };
</script>

<script>
  import { Story } from '@storybook/addon-svelte-csf';

  const mockArticle = {
    title: 'The Sacred Cycle of Synchronicity',
    subtitle: 'Understanding intention, attention, and manifestation',
    preview: 'In the garden of consciousness, our intentions are seeds planted with care. When we tend to them with focused attention, they grow into the reality we seek to manifest.',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    hashtags: ['MythsForANewAge', 'SyncEngine', 'Philosophy'],
    views: 646,
    likes: 84,
    readingTime: 10,
    publishedDate: '2025-07-14T00:00:00.000Z',
    substackUrl: 'https://aeonmyths.substack.com/p/synchronicity-engine'
  };
</script>

<Story
  name="Default"
  args={{
    article: mockArticle
  }}
>
  {#snippet children(args)}
    <div style="max-width: 400px;">
      <ArticleCard {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Long Title"
  args={{
    article: {
      ...mockArticle,
      title: 'The Sacred Cycle of Synchronicity: A Deep Exploration of Quantum Consciousness and Reality Manifestation Through Focused Intention'
    }
  }}
>
  {#snippet children(args)}
    <div style="max-width: 400px;">
      <ArticleCard {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="No Hashtags"
  args={{
    article: {
      ...mockArticle,
      hashtags: []
    }
  }}
>
  {#snippet children(args)}
    <div style="max-width: 400px;">
      <ArticleCard {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Grid View"
  args={{
    article: mockArticle
  }}
>
  {#snippet children(args)}
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem;">
      <ArticleCard {...args} />
      <ArticleCard {...args} />
      <ArticleCard {...args} />
    </div>
  {/snippet}
</Story>
