import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';

// Mock data structure - this would come from your backend
const mockArticles = [
  {
    id: 1,
    title: "The Sacred Architecture of Healing Spaces",
    subtitle: "Exploring ancient temple designs",
    preview: "Throughout history, temples have served as more than places of worship—they've been sanctuaries of healing, transformation, and refuge. The architectural principles embedded in these sacred spaces reflect a deep understanding of human psychology and spiritual need.\n\nFrom the soaring columns of Greek temples to the intimate meditation halls of Buddhist monasteries, these structures were designed to facilitate inner peace and collective healing...",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
    substackUrl: "https://example.substack.com/p/sacred-architecture",
    hashtags: ["TemplesOfRefuge", "SacredArchitecture"],
    publishedDate: "2025-10-15"
  },
  {
    id: 2,
    title: "Community as Container",
    subtitle: "Building modern refuges together",
    preview: "What makes a space truly feel like refuge? It's not just the physical structure, but the quality of presence and intention held within it. In our fragmented modern world, we're learning to recreate these containers for healing.\n\nThe ancient temples understood this: refuge is both sanctuary and community, solitude and connection. Today's temples of refuge might look different—community centers, retreat spaces, even digital gatherings...",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
    substackUrl: "https://example.substack.com/p/community-container",
    hashtags: ["TemplesOfRefuge", "Community"],
    publishedDate: "2025-10-10"
  },
  {
    id: 3,
    title: "Thresholds and Transitions",
    subtitle: "The liminal spaces of transformation",
    preview: "Every temple has a threshold—a doorway marking the transition from ordinary to sacred space. This architectural feature reflects a profound psychological truth: transformation requires crossing from one state to another.\n\nIn our temples of refuge, we must honor these thresholds. The moment of entering, the removal of shoes, the lighting of incense—these aren't mere rituals but necessary markers...",
    imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
    substackUrl: "https://example.substack.com/p/thresholds",
    hashtags: ["TemplesOfRefuge", "Transformation"],
    publishedDate: "2025-10-05"
  },
  {
    id: 4,
    title: "Synchronicity in Daily Life",
    subtitle: "Recognizing meaningful coincidences",
    preview: "Carl Jung described synchronicity as meaningful coincidences that reveal the hidden patterns connecting our inner and outer worlds. When we learn to recognize these moments, life becomes less random and more purposeful.\n\nThe challenge isn't that synchronicities don't happen—they happen constantly. The challenge is developing the awareness to notice them, and the wisdom to understand what they're pointing toward...",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    substackUrl: "https://example.substack.com/p/synchronicity-daily",
    hashtags: ["Synchronicity", "Awareness"],
    publishedDate: "2025-10-12"
  }
];

const SubstackGallery = () => {
  const [articles, setArticles] = useState(mockArticles);
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract all unique hashtags
  const allHashtags = ['all', ...new Set(articles.flatMap(a => a.hashtags))];

  // Filter articles based on selected tag and search
  const filteredArticles = articles.filter(article => {
    const matchesTag = selectedTag === 'all' || article.hashtags.includes(selectedTag);
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  // Simulate refreshing feed
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In production, this would call your backend API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const truncatePreview = (text, sentences = 2) => {
    const sentenceArray = text.split(/[.!?]+\s/);
    return sentenceArray.slice(0, sentences).join('. ') + (sentenceArray.length > sentences ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Synchronicity Engine</h1>
              <p className="text-purple-200">Curated articles from your Substack</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Sync Feed'}
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Hashtag filters */}
          <div className="flex flex-wrap gap-2">
            {allHashtags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                {tag === 'all' ? 'All Articles' : `#${tag}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No articles found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                className="group bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                    {article.hashtags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-600/80 backdrop-blur-sm text-xs text-white rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-purple-300 text-sm mb-3 font-medium">
                    {article.subtitle}
                  </p>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {truncatePreview(article.preview)}
                  </p>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs text-gray-400">
                      {new Date(article.publishedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <a
                      href={article.substackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Read More
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubstackGallery;