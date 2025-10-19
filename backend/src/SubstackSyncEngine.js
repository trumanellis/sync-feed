// backend/src/SubstackSyncEngine.js
// Backend service to fetch and parse Substack RSS feed

const axios = require('axios');
const Parser = require('rss-parser');
const cheerio = require('cheerio');

class SubstackSyncEngine {
  constructor(substackUrl) {
    this.substackUrl = substackUrl;
    this.rssParser = new Parser();
    this.feedUrl = `${substackUrl}/feed`;
  }

  // Main method to fetch and parse articles
  async syncArticles() {
    try {
      const feed = await this.rssParser.parseURL(this.feedUrl);
      const articles = [];

      for (const item of feed.items) {
        const article = await this.parseArticle(item);
        if (article) {
          articles.push(article);
        }
      }

      return articles;
    } catch (error) {
      console.error('Error syncing Substack feed:', error);
      throw error;
    }
  }

  // Parse individual article from RSS item
  async parseArticle(item) {
    try {
      // Extract basic metadata
      const title = item.title || '';
      const link = item.link || '';
      const publishedDate = item.pubDate || item.isoDate;
      
      // Parse HTML content to extract hashtags and clean text
      const $ = cheerio.load(item['content:encoded'] || item.content || '');
      
      // Remove script and style elements
      $('script, style').remove();
      
      // Get full text content
      const fullText = $.text();
      
      // Extract hashtags (looking for #TagName pattern)
      const hashtags = this.extractHashtags(fullText);
      
      // Get subtitle (often in the first paragraph or meta description)
      const subtitle = item.contentSnippet?.split('\n')[0] || 
                      $('p').first().text().substring(0, 100) || '';
      
      // Get preview (first two paragraphs)
      const paragraphs = $('p').map((i, el) => $(el).text()).get();
      const preview = paragraphs.slice(0, 2).join('\n\n');
      
      // Extract featured image
      const imageUrl = this.extractFeaturedImage($, item);

      return {
        id: this.generateId(link),
        title,
        subtitle: subtitle.trim(),
        preview: preview.trim(),
        substackUrl: link,
        imageUrl,
        hashtags,
        publishedDate,
        rawContent: fullText,
        views: Math.floor(Math.random() * 2000), // Mock data
        likes: Math.floor(Math.random() * 150),  // Mock data
        readingTime: Math.ceil(fullText.split(' ').length / 200) // ~200 words per minute
      };
    } catch (error) {
      console.error('Error parsing article:', error);
      return null;
    }
  }

  // Extract hashtags from text
  extractHashtags(text) {
    // Match hashtags: #Word or #MultipleWords (with camelCase)
    const hashtagRegex = /#([A-Za-z][A-Za-z0-9]*(?:[A-Z][a-z0-9]*)*)/g;
    const matches = text.matchAll(hashtagRegex);
    
    const hashtags = new Set();
    for (const match of matches) {
      hashtags.add(match[1]);
    }
    
    return Array.from(hashtags);
  }

  // Extract featured image from article
  extractFeaturedImage($, item) {
    // Try multiple methods to find the image
    
    // Method 1: Check RSS enclosure
    if (item.enclosure && item.enclosure.url) {
      return item.enclosure.url;
    }
    
    // Method 2: Check media:content or media:thumbnail
    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
      return item['media:content'].$.url;
    }
    
    // Method 3: Find first image in content
    const firstImg = $('img').first();
    if (firstImg.length) {
      return firstImg.attr('src');
    }
    
    // Fallback: return a default placeholder
    return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80';
  }

  // Generate unique ID from URL
  generateId(url) {
    return url.split('/').pop() || Math.random().toString(36).substr(2, 9);
  }

  // Group articles by hashtag
  groupByHashtag(articles) {
    const grouped = {};
    
    articles.forEach(article => {
      article.hashtags.forEach(tag => {
        if (!grouped[tag]) {
          grouped[tag] = [];
        }
        grouped[tag].push(article);
      });
    });
    
    return grouped;
  }
}

module.exports = SubstackSyncEngine;