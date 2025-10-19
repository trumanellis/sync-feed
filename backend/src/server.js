// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SubstackSyncEngine = require('./SubstackSyncEngine');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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