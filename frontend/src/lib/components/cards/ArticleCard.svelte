<script>
    import { truncatePreview, formatDate } from '$lib/utils/formatters';

    export let article;
</script>

<div class="card-hover backdrop-blur-sm rounded-xl overflow-hidden">
    <!-- Image -->
    <div class="relative h-48 overflow-hidden">
        <img
            src={article.imageUrl}
            alt={article.title}
            class="w-full h-full object-cover"
            on:error={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80';
            }}
        />
        <div class="image-overlay absolute inset-0"></div>
        {#if article.hashtags.length > 0}
            <div class="absolute bottom-3 left-3 flex flex-wrap gap-1">
                {#each article.hashtags as tag}
                    <span class="hashtag-badge px-2 py-1 backdrop-blur-sm text-xs rounded" style="color: #F7F3E9;">
                        #{tag}
                    </span>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Content -->
    <div class="p-5">
        <h3 class="title-glow text-xl font-bold text-white mb-2 transition-all cursor-pointer">
            {article.title}
        </h3>
        <p class="text-sm mb-3 font-medium" style="color: #84A98C;">
            {article.subtitle}
        </p>
        <p class="text-gray-300 text-sm mb-4 leading-relaxed">
            {truncatePreview(article.preview)}
        </p>

        <!-- Stats -->
        <div class="flex items-center gap-4 mb-4 text-xs" style="color: #D4AF37;">
            <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                {article.views}
            </span>
            <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                {article.likes}
            </span>
            <span>{article.readingTime} min read</span>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-4" style="border-top: 1px solid rgba(212, 175, 55, 0.3);">
            <span class="text-xs text-gray-400">
                {formatDate(article.publishedDate)}
            </span>
            <a
                href={article.substackUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="read-more-link flex items-center gap-1 text-sm transition-all"
            >
                Read More
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
            </a>
        </div>
    </div>
</div>
