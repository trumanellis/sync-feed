// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const SubstackSyncEngine = require('./SubstackSyncEngine');
const { extract } = require('@extractus/oembed-extractor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Serve static files from public directory
const publicPath = path.join(__dirname, '../../public');
app.use('/images', express.static(path.join(publicPath, 'images')));

// Initialize sync engine
const substackUrl = process.env.SUBSTACK_URL || 'https://yoursubstack.substack.com';
const syncEngine = new SubstackSyncEngine(substackUrl);

// Store articles in memory for now (no database needed for testing)
let articlesCache = [];
let lastSync = null;

// Sync articles function
async function syncArticles() {
  try {
    console.log('Syncing articles from Substack...');
    articlesCache = await syncEngine.syncArticles();
    lastSync = new Date();
    console.log(`✅ Synced ${articlesCache.length} articles`);
    return articlesCache;
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    throw error;
  }
}

// Routes

// Root route - API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Synchronicity Engine API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      articles: '/api/articles',
      articlesWithHashtag: '/api/articles?hashtag=YourHashtag',
      search: '/api/articles?search=keyword',
      hashtags: '/api/hashtags',
      hashtagIntro: '/api/hashtag-intro/:hashtag',
      sync: 'POST /api/sync'
    },
    stats: {
      articlesCount: articlesCache.length,
      lastSync: lastSync,
      substackUrl: substackUrl
    }
  });
});

// Get all articles
app.get('/api/articles', async (req, res) => {
  try {
    const { hashtag, search } = req.query;
    
    let articles = articlesCache.length > 0 ? articlesCache : await syncArticles();
    
    // Filter by hashtag
    if (hashtag && hashtag !== 'all') {
      articles = articles.filter(a => a.hashtags.includes(hashtag));
    }
    
    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.subtitle.toLowerCase().includes(searchLower) ||
        a.preview.toLowerCase().includes(searchLower)
      );
    }
    
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all hashtags
app.get('/api/hashtags', (req, res) => {
  try {
    const allTags = new Set();
    articlesCache.forEach(article => {
      article.hashtags.forEach(tag => allTags.add(tag));
    });
    res.json(Array.from(allTags).sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual sync
app.post('/api/sync', async (req, res) => {
  try {
    const articles = await syncArticles();
    res.json({
      success: true,
      count: articles.length,
      lastSync
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get HTML content for a hashtag (full HTML file)
app.get('/api/html-content/:hashtag', async (req, res) => {
  try {
    const { hashtag } = req.params;
    const htmlDir = path.join(__dirname, '../../html');
    const htmlPath = path.join(htmlDir, `${hashtag}.html`);

    try {
      await fs.access(htmlPath);
      const htmlContent = await fs.readFile(htmlPath, 'utf8');

      // Extract just the main content (everything inside <main> tag if it exists)
      const mainMatch = htmlContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      const content = mainMatch ? mainMatch[1] : htmlContent;

      res.json({
        exists: true,
        hashtag,
        content
      });
    } catch (error) {
      res.status(404).json({
        exists: false,
        hashtag,
        content: null
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to process embed syntax in markdown
async function processEmbeds(markdownContent) {
  // Match ::embed[url]{options}
  const embedPattern = /::embed\[([^\]]+)\](\{[^}]+\})?/g;
  const matches = [...markdownContent.matchAll(embedPattern)];

  // Store embed HTML by placeholder
  const embedCache = {};
  let markdownWithPlaceholders = markdownContent;

  // Replace embeds with placeholders
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const [fullMatch, url, optionsStr] = match;
    const placeholder = `{{EMBED_PLACEHOLDER_${i}}}`;
    let options = {};

    // Parse options if provided
    if (optionsStr) {
      try {
        const optionsJson = optionsStr.replace(/(\w+)=/g, '"$1":').replace(/"/g, '"');
        options = JSON.parse(optionsJson);
      } catch (e) {
        console.warn('Failed to parse embed options:', optionsStr);
      }
    }

    try {
      // Fetch embed data
      const embedData = await extract(url);

      if (embedData && embedData.html) {
        // Create wrapper with golden ratio styling (CSS-controlled)
        const embedHtml = `
          <div class="embed-container" data-provider="${embedData.provider_name || 'unknown'}" data-url="${url}">
            <div class="embed-wrapper">
              ${embedData.html}
            </div>
            ${embedData.title ? `<div class="embed-caption">${embedData.title}</div>` : ''}
          </div>
        `;

        embedCache[placeholder] = embedHtml;
      } else {
        // Fallback: create a link
        embedCache[placeholder] = `<p class="embed-error">Unable to embed: <a href="${url}" target="_blank">${url}</a></p>`;
      }
    } catch (error) {
      console.error(`Failed to process embed for ${url}:`, error.message);
      // Fallback: create a link
      embedCache[placeholder] = `<p class="embed-error">Unable to embed: <a href="${url}" target="_blank">${url}</a></p>`;
    }

    // Replace the embed syntax with placeholder
    markdownWithPlaceholders = markdownWithPlaceholders.replace(fullMatch, placeholder);
  }

  return { markdownWithPlaceholders, embedCache };
}

// Get markdown content for a hashtag (rendered to HTML)
app.get('/api/markdown-content/:hashtag', async (req, res) => {
  try {
    const { hashtag } = req.params;
    const markdownDir = path.join(__dirname, '../../markdown');
    const markdownPath = path.join(markdownDir, `${hashtag}.md`);

    try {
      await fs.access(markdownPath);
      const markdownRaw = await fs.readFile(markdownPath, 'utf8');

      // Step 1: Process embeds and get placeholders
      const { markdownWithPlaceholders, embedCache } = await processEmbeds(markdownRaw);

      // Step 2: Convert markdown to HTML
      let markdownHtml = marked(markdownWithPlaceholders);

      // Step 3: Replace placeholders with actual embed HTML
      for (const [placeholder, embedHtml] of Object.entries(embedCache)) {
        // Escape curly braces for regex
        const escapedPlaceholder = placeholder.replace(/[{}]/g, '\\$&');
        // The placeholder might be wrapped in <p> tags by marked
        markdownHtml = markdownHtml.replace(new RegExp(`<p>${escapedPlaceholder}</p>`, 'g'), embedHtml);
        markdownHtml = markdownHtml.replace(new RegExp(escapedPlaceholder, 'g'), embedHtml);
      }

      // Fix relative image paths to use the API server
      markdownHtml = markdownHtml.replace(/src="\.\/images\//g, 'src="http://localhost:3000/images/');
      markdownHtml = markdownHtml.replace(/src="images\//g, 'src="http://localhost:3000/images/');

      res.json({
        exists: true,
        hashtag,
        content: markdownHtml,
        raw: markdownRaw
      });
    } catch (error) {
      res.status(404).json({
        exists: false,
        hashtag,
        content: null
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get HTML and markdown content for a hashtag (legacy intro endpoint)
app.get('/api/hashtag-intro/:hashtag', async (req, res) => {
  try {
    const { hashtag } = req.params;
    const htmlDir = path.join(__dirname, '../../html');
    const markdownDir = path.join(__dirname, '../../markdown');
    const htmlPath = path.join(htmlDir, `${hashtag}.html`);
    const markdownPath = path.join(markdownDir, `${hashtag}.md`);

    let htmlFileContent = null;
    let markdownHtmlContent = null;
    let markdownRawContent = null;

    // Try to read HTML file
    try {
      await fs.access(htmlPath);
      htmlFileContent = await fs.readFile(htmlPath, 'utf8');
    } catch (error) {
      // HTML file doesn't exist, that's okay
    }

    // Try to read markdown file
    try {
      await fs.access(markdownPath);
      markdownRawContent = await fs.readFile(markdownPath, 'utf8');
      markdownHtmlContent = marked(markdownRawContent);

      // Fix relative image paths to use the API server
      markdownHtmlContent = markdownHtmlContent.replace(/src="\.\/images\//g, 'src="http://localhost:3000/images/');
      markdownHtmlContent = markdownHtmlContent.replace(/src="images\//g, 'src="http://localhost:3000/images/');
    } catch (error) {
      // Markdown file doesn't exist, that's okay
    }

    // Return response
    const exists = htmlFileContent !== null || markdownHtmlContent !== null;
    res.json({
      exists,
      hashtag,
      htmlFile: htmlFileContent,
      markdown: markdownRawContent,
      html: markdownHtmlContent,
      content: markdownHtmlContent // For backwards compatibility
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Embed API endpoints

// Fetch embed data from URL
app.post('/api/embed/fetch', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Try to extract oEmbed data
    const embedData = await extract(url);

    if (!embedData) {
      return res.status(404).json({ error: 'No embed data found for this URL' });
    }

    // Return embed data with additional metadata
    res.json({
      success: true,
      url,
      provider: embedData.provider_name,
      type: embedData.type,
      title: embedData.title,
      html: embedData.html,
      width: embedData.width,
      height: embedData.height,
      thumbnailUrl: embedData.thumbnail_url,
      authorName: embedData.author_name,
      authorUrl: embedData.author_url,
      raw: embedData
    });
  } catch (error) {
    console.error('Embed fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate if URL is embeddable
app.post('/api/embed/validate', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Check if URL matches known embed providers
    const embedProviders = [
      { name: 'Instagram', pattern: /instagram\.com\/(p|reel|tv)\/[\w-]+/ },
      { name: 'YouTube', pattern: /youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+/ },
      { name: 'Twitter', pattern: /twitter\.com\/[\w]+\/status\/\d+|x\.com\/[\w]+\/status\/\d+/ },
      { name: 'TikTok', pattern: /tiktok\.com\/@[\w.]+\/video\/\d+/ },
      { name: 'Spotify', pattern: /open\.spotify\.com\/(track|album|playlist|episode)\/[\w]+/ },
      { name: 'Vimeo', pattern: /vimeo\.com\/\d+/ },
      { name: 'SoundCloud', pattern: /soundcloud\.com\/[\w-]+\/[\w-]+/ },
      { name: 'CodePen', pattern: /codepen\.io\/[\w-]+\/pen\/[\w-]+/ }
    ];

    const matchedProvider = embedProviders.find(p => p.pattern.test(url));

    // Try to extract oEmbed to confirm
    let isEmbeddable = false;
    let embedType = null;

    try {
      const embedData = await extract(url);
      if (embedData) {
        isEmbeddable = true;
        embedType = embedData.type;
      }
    } catch (error) {
      // Not embeddable via oEmbed
    }

    res.json({
      success: true,
      url,
      isEmbeddable,
      provider: matchedProvider ? matchedProvider.name : 'Unknown',
      embedType,
      detected: !!matchedProvider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    articlesCount: articlesCache.length,
    lastSync,
    substackUrl
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Synchronicity Engine API running on http://localhost:${PORT}`);
  console.log(`📡 Substack URL: ${substackUrl}`);
  
  // Do initial sync
  try {
    await syncArticles();
  } catch (error) {
    console.error('Initial sync failed. Will retry on next request.');
  }
});

module.exports = app;