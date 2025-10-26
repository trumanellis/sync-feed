<script>
    // Import CSS in order: tokens → base → layout → components → content
    import '$lib/styles/tokens.css';
    import '$lib/styles/base.css';
    import '$lib/styles/layout.css';
    import '$lib/styles/components.css';
    import '$lib/styles/markdown.css'; // TODO: Rename to content.css after migration
    import '$lib/styles/responsive.css';
</script>

<slot />
