<script>
    // Import CSS in order: tokens → base → layout → components → content
    import '$lib/styles/tokens.css';
    import '$lib/styles/base.css';
    import '$lib/styles/layout.css';
    import '$lib/styles/components.css';
    import '$lib/styles/content.css';
    import '$lib/styles/responsive.css';
    import GradientBackground from '$lib/components/GradientBackground.svelte';
</script>

<GradientBackground logoSrc="/images/glowing-eye.png" />

<slot />
