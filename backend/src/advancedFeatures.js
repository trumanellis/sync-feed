// Advanced backend features for Synchronicity Engine
// Including caching, webhooks, image optimization, and analytics

const express = require('express');
const Redis = require('redis');
const sharp = require('sharp');
const axios = require('axios');
const crypto = require('crypto');

// ============================================
// REDIS CACHING LAYER
// ============================================

class CacheManager {
  constructor() {
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redis.connect();
    this.defaultTTL = 3600; // 1 hour
  }

  async get(key) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await this.redis.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  async invalidateAll() {
    await this.invalidate('articles:*');
    await this.invalidate('hashtags:*');
    await this.invalidate('analytics:*');
  }
}

// ============================================
// IMAGE OPTIMIZATION SERVICE
// ============================================

class ImageOptimizer {
  constructor() {
    this.cloudinaryUrl = process.env.CLOUDINARY_URL;
    this.sizes = {
      thumbnail: { width: 400, height: 300 },
      card: { width: 800, height: 600 },
      hero: { width: 1200, height: 800 }
    };
  }

  async optimizeAndUpload(imageUrl, articleId) {
    try {
      // Download original image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });
      const buffer = Buffer.from(response.data);

      // Generate optimized versions
      const optimized = {};
      
      for (const [size, dimensions] of Object.entries(this.sizes)) {
        const processedBuffer = await sharp(buffer)
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();

        // Upload to Cloudinary or S3
        const uploadedUrl = await this.uploadToStorage(
          processedBuffer,
          `${articleId}_${size}.jpg`
        );
        
        optimized[size] = uploadedUrl;
      }

      return optimized;
    } catch (error) {
      console.error('Image optimization error:', error);
      return { card: imageUrl }; // Fallback to original
    }
  }

  async uploadToStorage(buffer, filename) {
    // Example using Cloudinary
    if (this.cloudinaryUrl) {
      const formData = new FormData();
      formData.append('file', buffer);
      formData.append('upload_preset', process.env.CLOUDINARY_PRESET);
      
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      
      return response.data.secure_url;
    }
    
    // Fallback: return original URL or implement S3 upload
    return null;
  }
}

// ============================================
// ANALYTICS TRACKER
// ============================================

class AnalyticsTracker {
  constructor(db) {
    this.db = db;
  }

  async trackView(articleId, metadata = {}) {
    try {
      await this.db.analytics.create({
        articleId,
        eventType: 'view',
        metadata,
        timestamp: new Date()
      });

      // Update article view count
      await this.db.articles.increment('views', {
        where: { id: articleId }
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  async trackLike(articleId, userId) {
    try {
      await this.db.likes.create({
        articleId,
        userId,
        timestamp: new Date()
      });

      await this.db.articles.increment('likes', {
        where: { id: articleId }
      });
    } catch (error) {
      console.error('Like tracking error:', error);
    }
  }

  async getArticleAnalytics(articleId, timeRange = '30d') {
    const startDate = this.getStartDate(timeRange);
    
    const analytics = await this.db.analytics.findAll({
      where: {
        articleId,
        timestamp: { $gte: startDate }
      },
      attributes: [
        [this.db.sequelize.fn('DATE', this.db.sequelize.col('timestamp')), 'date'],
        [this.db.sequelize.fn('COUNT', '*'), 'views']
      ],
      group: ['date'],
      order: [['date', 'ASC']]
    });

    return analytics;
  }

  async getHashtagPerformance() {
    const articles = await this.db.articles.findAll({
      attributes: ['hashtags', 'views', 'likes']
    });

    const hashtagStats = {};
    
    articles.forEach(article => {
      article.hashtags.forEach(tag => {
        if (!hashtagStats[tag]) {
          hashtagStats[tag] = { views: 0, likes: 0, count: 0 };
        }
        hashtagStats[tag].views += article.views;
        hashtagStats[tag].likes += article.likes;
        hashtagStats[tag].count += 1;
      });
    });

    return Object.entries(hashtagStats).map(([tag, stats]) => ({
      tag,
      ...stats,
      avgViews: Math.round(stats.views / stats.count),
      avgLikes: Math.round(stats.likes / stats.count)
    })).sort((a, b) => b.views - a.views);
  }

  getStartDate(timeRange) {
    const now = new Date();
    const ranges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    const days = ranges[timeRange] || 30;
    return new Date(now.setDate(now.getDate() - days));
  }
}

// ============================================
// WEBHOOK HANDLER (for Substack notifications)
// ============================================

class WebhookHandler {
  constructor(syncEngine, cacheManager) {
    this.syncEngine = syncEngine;
    this.cacheManager = cacheManager;
    this.secret = process.env.WEBHOOK_SECRET;
  }

  verifySignature(payload, signature) {
    const hmac = crypto.createHmac('sha256', this.secret);
    const digest = hmac.update(JSON.stringify(payload)).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  }

  async handleNewArticle(webhookPayload) {
    try {
      console.log('Webhook: New article published');
      
      // Sync specific article
      const article = await this.syncEngine.syncSingleArticle(
        webhookPayload.articleUrl
      );

      // Invalidate caches
      await this.cacheManager.invalidateAll();

      return { success: true, article };
    } catch (error) {
      console.error('Webhook handler error:', error);
      return { success: false, error: error.message };
    }
  }
}

// ============================================
// ENHANCED API ROUTES
// ============================================

function setupAdvancedRoutes(app, db, syncEngine) {
  const cache = new CacheManager();
  const imageOptimizer = new ImageOptimizer();
  const analytics = new AnalyticsTracker(db);
  const webhookHandler = new WebhookHandler(syncEngine, cache);

  // Articles with caching
  app.get('/api/articles', async (req, res) => {
    try {
      const { hashtag, search, limit = 50, offset = 0 } = req.query;
      const cacheKey = `articles:${hashtag || 'all'}:${search || 'none'}:${limit}:${offset}`;
      
      // Try cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ ...cached, cached: true });
      }

      // Build query
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

      const articles = await db.articles.findAll({
        where: query,
        order: [['publishedDate', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const total = await db.articles.count({ where: query });

      const result = {
        articles,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + articles.length) < total
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, result, 300);

      res.json({ ...result, cached: false });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Single article with analytics tracking
  app.get('/api/articles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const article = await db.articles.findByPk(id);
      
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Track view (async, don't wait)
      analytics.trackView(id, {
        userAgent: req.headers['user-agent'],
        referrer: req.headers['referer']
      }).catch(console.error);

      res.json(article);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Like article
  app.post('/api/articles/:id/like', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'anonymous'; // Implement auth as needed

      await analytics.trackLike(id, userId);
      
      // Invalidate article cache
      await cache.invalidate(`articles:*`);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get article analytics
  app.get('/api/articles/:id/analytics', async (req, res) => {
    try {
      const { id } = req.params;
      const { timeRange = '30d' } = req.query;
      
      const cacheKey = `analytics:${id}:${timeRange}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const data = await analytics.getArticleAnalytics(id, timeRange);
      
      await cache.set(cacheKey, data, 3600); // Cache for 1 hour
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get hashtag performance analytics
  app.get('/api/analytics/hashtags', async (req, res) => {
    try {
      const cacheKey = 'analytics:hashtags:all';
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const data = await analytics.getHashtagPerformance();
      
      await cache.set(cacheKey, data, 3600);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get overall analytics dashboard
  app.get('/api/analytics/dashboard', async (req, res) => {
    try {
      const cacheKey = 'analytics:dashboard';
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const [
        totalArticles,
        totalViews,
        totalLikes,
        hashtagPerformance,
        recentArticles
      ] = await Promise.all([
        db.articles.count(),
        db.articles.sum('views'),
        db.articles.sum('likes'),
        analytics.getHashtagPerformance(),
        db.articles.findAll({
          order: [['publishedDate', 'DESC']],
          limit: 10
        })
      ]);

      const avgReadingTime = await db.articles.average('readingTime');

      const dashboard = {
        totalArticles,
        totalViews: totalViews || 0,
        totalLikes: totalLikes || 0,
        avgReadingTime: Math.round(avgReadingTime || 0),
        topHashtags: hashtagPerformance.slice(0, 5),
        recentArticles,
        lastUpdated: new Date()
      };

      await cache.set(cacheKey, dashboard, 300); // 5 minutes
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sync with image optimization
  app.post('/api/sync', async (req, res) => {
    try {
      const articles = await syncEngine.syncArticles();
      
      // Optimize images for new articles (async)
      articles.forEach(async (article) => {
        if (article.imageUrl) {
          const optimized = await imageOptimizer.optimizeAndUpload(
            article.imageUrl,
            article.id
          );
          
          await db.articles.update(
            { optimizedImages: optimized },
            { where: { id: article.id } }
          );
        }
      });

      // Invalidate all caches
      await cache.invalidateAll();

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

  // Webhook endpoint for Substack notifications
  app.post('/api/webhook/substack', async (req, res) => {
    try {
      const signature = req.headers['x-substack-signature'];
      
      // Verify webhook signature
      if (!webhookHandler.verifySignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const result = await webhookHandler.handleNewArticle(req.body);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk operations - Update hashtags manually
  app.put('/api/articles/:id/hashtags', async (req, res) => {
    try {
      const { id } = req.params;
      const { hashtags } = req.body;

      if (!Array.isArray(hashtags)) {
        return res.status(400).json({ error: 'Hashtags must be an array' });
      }

      await db.articles.update(
        { hashtags },
        { where: { id } }
      );

      await cache.invalidateAll();

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Batch update images
  app.post('/api/admin/optimize-images', async (req, res) => {
    try {
      const articles = await db.articles.findAll({
        where: {
          optimizedImages: null
        }
      });

      let processed = 0;
      for (const article of articles) {
        if (article.imageUrl) {
          const optimized = await imageOptimizer.optimizeAndUpload(
            article.imageUrl,
            article.id
          );
          
          await db.articles.update(
            { optimizedImages: optimized },
            { where: { id: article.id } }
          );
          processed++;
        }
      }

      res.json({
        success: true,
        processed,
        total: articles.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search with full-text search (PostgreSQL)
  app.get('/api/search', async (req, res) => {
    try {
      const { q, limit = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Query parameter required' });
      }

      const cacheKey = `search:${q}:${limit}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ ...cached, cached: true });
      }

      // Full-text search using PostgreSQL
      const articles = await db.sequelize.query(`
        SELECT *,
          ts_rank(
            to_tsvector('english', title || ' ' || subtitle || ' ' || preview),
            plainto_tsquery('english', :query)
          ) as rank
        FROM articles
        WHERE to_tsvector('english', title || ' ' || subtitle || ' ' || preview)
          @@ plainto_tsquery('english', :query)
        ORDER BY rank DESC
        LIMIT :limit
      `, {
        replacements: { query: q, limit: parseInt(limit) },
        type: db.sequelize.QueryTypes.SELECT
      });

      const result = { articles, query: q };
      await cache.set(cacheKey, result, 300);

      res.json({ ...result, cached: false });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export data
  app.get('/api/export', async (req, res) => {
    try {
      const { format = 'json' } = req.query;
      
      const articles = await db.articles.findAll({
        order: [['publishedDate', 'DESC']]
      });

      if (format === 'csv') {
        const csv = articles.map(a => ({
          title: a.title,
          subtitle: a.subtitle,
          url: a.substackUrl,
          hashtags: a.hashtags.join(', '),
          views: a.views,
          likes: a.likes,
          publishedDate: a.publishedDate
        }));

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=articles.csv');
        res.send(convertToCSV(csv));
      } else {
        res.json(articles);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get('/api/health', async (req, res) => {
    try {
      await db.sequelize.authenticate();
      const redisConnected = cache.redis.isOpen;
      
      res.json({
        status: 'healthy',
        database: 'connected',
        cache: redisConnected ? 'connected' : 'disconnected',
        timestamp: new Date()
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message
      });
    }
  });
}

// Helper function for CSV conversion
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

module.exports = {
  CacheManager,
  ImageOptimizer,
  AnalyticsTracker,
  WebhookHandler,
  setupAdvancedRoutes
};