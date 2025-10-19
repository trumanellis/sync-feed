# Synchronicity Engine - Complete Setup Guide

## Overview
This system automatically syncs your Substack articles, extracts hashtags, and displays them in a beautiful gallery interface.

## Architecture
```
Substack RSS Feed → Backend Parser → Database → Frontend Gallery
                         ↓
                   Scheduled Sync (hourly)
```

---

## 1. Backend Setup

### Prerequisites
```bash
npm install express axios rss-parser cheerio node-cron
npm install sequelize pg pg-hstore  # For PostgreSQL
# OR
npm install mongoose  # For MongoDB
```

### Database Schema (PostgreSQL/Sequelize)

```javascript
// models/Article.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subtitle: {
      type: DataTypes.TEXT
    },
    preview: {
      type: DataTypes.TEXT
    },
    substackUrl: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    hashtags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    publishedDate: {
      type: DataTypes.DATE
    },
    rawContent: {
      type: DataTypes.TEXT
    }
  });

  return Article;
};
```

### Alternative: MongoDB Schema

```javascript
// models/Article.js (Mongoose)
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  preview: String,
  substackUrl: { type: String, required: true, unique: true },
  imageUrl: String,
  hashtags: [String],
  publishedDate: Date,
  rawContent: String
}, {
  timestamps: true
});

// Index for efficient hashtag queries
articleSchema.index({ hashtags: 1 });
articleSchema.index({ publishedDate: -1 });

module.exports = mongoose.model('Article', articleSchema);
```

---

## 2. Environment Configuration

Create a `.env` file:

```bash
# Substack Configuration
SUBSTACK_URL=https://yoursubstack.substack.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/syncengine
# OR
MONGODB_URI=mongodb://localhost:27017/syncengine

# Server
PORT=3000
NODE_ENV=production

# Sync Schedule (cron format)
SYNC_SCHEDULE=0 * * * *  # Every hour

# CORS (for frontend)
FRONTEND_URL=https://yourdomain.com
```

---

## 3. Complete Server Implementation

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const SubstackSyncEngine = require('./SubstackSyncEngine');
const Article = require('./models/Article');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(express.json());

// Initialize sync engine
const syncEngine = new SubstackSyncEngine(process.env.SUBSTACK_URL);

// Sync articles and save to database
async function syncAndSave() {
  try {
    console.log('Starting Substack sync...');
    const articles = await syncEngine.syncArticles();
    
    for (const articleData of articles) {
      await Article.upsert(articleData, {
        conflictFields: ['substackUrl']
      });
    }
    
    console.log(`Successfully synced ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}

// API Routes

// Get all articles or filter by hashtag
app.get('/api/articles', async (req, res) => {
  try {
    const { hashtag, search, limit = 50 } = req.query;
    
    let query = {};
    
    if (hashtag && hashtag !== 'all') {
      query.hashtags = { $contains: [hashtag] };
    }
    
    if (search) {
      query.$or = [
        { title: { $iLike: `%${search}%` } },
        { subtitle: { $iLike: `%${search}%` } },
        { preview: { $iLike: `%${search}%` } }
      ];
    }
    
    const articles = await Article.findAll({
      where: query,
      order: [['publishedDate', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all unique hashtags
app.get('/api/hashtags', async (req, res) => {
  try {
    const articles = await Article.findAll({
      attributes: ['hashtags']
    });
    
    const allTags = new Set();
    articles.forEach(article => {
      article.hashtags.forEach(tag => allTags.add(tag));
    });
    
    res.json(Array.from(allTags).sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual sync trigger
app.post('/api/sync', async (req, res) => {
  try {
    const articles = await syncAndSave();
    res.json({
      success: true,
      count: articles.length,
      message: 'Sync completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sync status
app.get('/api/sync/status', async (req, res) => {
  try {
    const count = await Article.count();
    const latest = await Article.findOne({
      order: [['publishedDate', 'DESC']]
    });
    
    res.json({
      totalArticles: count,
      latestArticle: latest ? {
        title: latest.title,
        publishedDate: latest.publishedDate
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scheduled sync (configurable via env)
const syncSchedule = process.env.SYNC_SCHEDULE || '0 * * * *';
cron.schedule(syncSchedule, async () => {
  console.log(`Running scheduled sync at ${new Date().toISOString()}`);
  await syncAndSave();
});

// Initial sync on startup
syncAndSave().catch(console.error);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Synchronicity Engine API running on port ${PORT}`);
  console.log(`📅 Scheduled sync: ${syncSchedule}`);
});
```

---

## 4. Frontend Integration

Update the React component to fetch from your API:

```javascript
// In your React component
const [articles, setArticles] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchArticles();
}, [selectedTag]);

const fetchArticles = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTag !== 'all') {
      params.append('hashtag', selectedTag);
    }
    
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/articles?${params}`
    );
    const data = await response.json();
    setArticles(data);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
  } finally {
    setLoading(false);
  }
};

const handleRefresh = async () => {
  setIsRefreshing(true);
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/api/sync`, {
      method: 'POST'
    });
    await fetchArticles();
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    setIsRefreshing(false);
  }
};
```

---

## 5. Deployment Checklist

### Backend (Node.js)
- [ ] Set up PostgreSQL or MongoDB database
- [ ] Configure environment variables
- [ ] Deploy to Heroku, Railway, or AWS
- [ ] Set up SSL certificate
- [ ] Configure CORS for your frontend domain

### Frontend (React)
- [ ] Build production version
- [ ] Deploy to Vercel, Netlify, or Cloudflare Pages
- [ ] Set `REACT_APP_API_URL` environment variable

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Monitor sync job success/failure
- [ ] Set up alerts for failed syncs

---

## 6. Hashtag Best Practices

### In Your Substack Articles

Add hashtags at the end of your articles:

```markdown
---

*Tags: #TemplesOfRefuge #SacredArchitecture #Community*
```

Or embed them naturally in text:

```markdown
This is part of my ongoing exploration of #TemplesOfRefuge, 
examining how we create spaces of healing in modern life.
```

### Supported Hashtag Formats
- `#TemplesOfRefuge` ✅
- `#SacredArchitecture` ✅
- `#temples-of-refuge` ❌ (hyphens not supported)
- `#temples of refuge` ❌ (spaces break the tag)

**Best practice:** Use CamelCase for multi-word hashtags.

---

## 7. Advanced Features (Optional)

### Image Upload Fallback
If Substack article doesn't have an image, allow manual upload:

```javascript
app.post('/api/articles/:id/image', upload.single('image'), async (req, res) => {
  // Upload to S3 or Cloudinary
  // Update article imageUrl
});
```

### Custom Sorting
```javascript
// Sort by popularity, reading time, etc.
const articles = await Article.findAll({
  order: [['views', 'DESC']]
});
```

### Rich Preview Generation
Use OpenGraph data for better previews:

```javascript
const ogs = require('open-graph-scraper');
const ogData = await ogs({ url: article.substackUrl });
```

---

## 8. Testing

```bash
# Test RSS parsing
curl https://yoursubstack.substack.com/feed

# Test API
curl http://localhost:3000/api/articles
curl http://localhost:3000/api/hashtags
curl -X POST http://localhost:3000/api/sync

# Test with specific hashtag
curl http://localhost:3000/api/articles?hashtag=TemplesOfRefuge
```

---

## Troubleshooting

### Issue: No hashtags detected
- Check that hashtags are formatted correctly (CamelCase, no spaces)
- Verify they appear in the RSS feed content
- Look in the article's raw HTML

### Issue: Images not loading
- Verify Substack includes images in RSS feed
- Check CORS settings on image URLs
- Use fallback placeholder images

### Issue: Sync not running
- Check cron schedule format
- Verify server timezone matches expected schedule
- Check server logs for errors

---

## Next Steps

1. **Set up your database** (PostgreSQL recommended)
2. **Deploy the backend** to a hosting service
3. **Configure the sync schedule** based on your publishing frequency
4. **Deploy the frontend** and connect to your API
5. **Publish your first article** with hashtags and test!

🎉 You now have a fully automated Substack gallery system!