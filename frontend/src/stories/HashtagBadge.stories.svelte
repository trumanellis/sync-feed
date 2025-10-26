<script context="module">
  import HashtagBadge from '$lib/components/typography/HashtagBadge.svelte';

  export const meta = {
    title: 'Components/Typography/HashtagBadge',
    component: HashtagBadge,
    tags: ['autodocs'],
    argTypes: {
      tag: { control: 'text' },
      variant: {
        control: 'select',
        options: ['default', 'active', 'outline']
      },
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg']
      }
    }
  };
</script>

<script>
  import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story
  name="Default"
  args={{
    tag: 'MythsForANewAge',
    variant: 'default',
    size: 'md'
  }}
>
  {#snippet children(args)}
    <HashtagBadge {...args} />
  {/snippet}
</Story>

<Story
  name="Active"
  args={{
    tag: 'SyncEngine',
    variant: 'active',
    size: 'md'
  }}
>
  {#snippet children(args)}
    <HashtagBadge {...args} />
  {/snippet}
</Story>

<Story
  name="Outline"
  args={{
    tag: 'TemplesOfRefuge',
    variant: 'outline',
    size: 'md'
  }}
>
  {#snippet children(args)}
    <HashtagBadge {...args} />
  {/snippet}
</Story>

<Story
  name="Sizes"
  args={{
    tag: 'Philosophy'
  }}
>
  {#snippet children(args)}
    <div style="display: flex; gap: 1rem; align-items: center;">
      <HashtagBadge {...args} size="sm" />
      <HashtagBadge {...args} size="md" />
      <HashtagBadge {...args} size="lg" />
    </div>
  {/snippet}
</Story>
