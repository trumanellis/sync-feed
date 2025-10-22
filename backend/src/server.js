// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const SubstackSyncEngine = require('./SubstackSyncEngine');

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

// Get HTML and markdown content for a hashtag
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
      html: markdownHtmlContent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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