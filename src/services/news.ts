// Types for news data
export interface NewsItem {
  guid: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category: string[];
  formattedDate?: string;
  excerpt?: string;
}

export interface NewsContent {
  title: string;
  content: string;
  images: string[];
  publishDate: string;
  author?: string;
  tags: string[];
}

class NewsService {
  private readonly RSS_URL = "https://www.animenewsnetwork.com/news/rss.xml?ann-edition=us";
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
  private cache: { data: NewsItem[]; timestamp: number } | null = null;

  /**
   * Parse XML string to DOM
   */
  private parseXML(xmlString: string): Document {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Check for parsing errors
    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      throw new Error("Failed to parse XML: " + parseError.textContent);
    }

    return xmlDoc;
  }

  /**
   * Extract text content from XML element
   */
  private getTextContent(element: Element | null): string {
    return element?.textContent?.trim() || "";
  }
  /**
   * Get anime news feeds
   */
  async getNewsFeeds(): Promise<NewsItem[]> {
    try {
      // Check cache first
      if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
        return this.cache.data.map((item) => ({
          ...item,
          formattedDate: this.formatDate(item.pubDate),
          excerpt: this.extractExcerpt(item.description),
        }));
      }

      // Use our internal API route to avoid CORS issues
      const response = await fetch('/api/news/rss');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();
      const xmlDoc = this.parseXML(xmlText);

      // Extract news items from RSS
      const items = xmlDoc.querySelectorAll("item");
      const newsItems: NewsItem[] = Array.from(items).map((item) => {
        const categories = Array.from(item.querySelectorAll("category"))
          .map((cat) => this.getTextContent(cat))
          .filter((cat) => cat.length > 0);

        return {
          guid: this.getTextContent(item.querySelector("guid")),
          title: this.getTextContent(item.querySelector("title")),
          link: this.getTextContent(item.querySelector("link")),
          description: this.getTextContent(item.querySelector("description")),
          pubDate: this.getTextContent(item.querySelector("pubDate")),
          category: categories.length > 0 ? categories : ["General"],
          formattedDate: this.formatDate(this.getTextContent(item.querySelector("pubDate"))),
          excerpt: this.extractExcerpt(this.getTextContent(item.querySelector("description"))),
        };
      });

      // Update cache
      this.cache = {
        data: newsItems,
        timestamp: Date.now(),
      };

      return newsItems;
    } catch (error) {
      console.error("Error fetching news feeds:", error);
      throw new Error("Failed to fetch anime news. Please try again later.");
    }
  }
  /**
   * Get full content for a news article
   */
  async getNewsContent(url: string): Promise<NewsContent> {
    try {
      // Use our internal API route to avoid CORS issues
      const response = await fetch(`/api/news/content?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();

      // Extract title from HTML
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].replace(" - Anime News Network", "").trim() : "Article";

      // Extract content from article body
      const contentMatches = html.match(/<div[^>]*class="[^"]*?article[^"]*?"[^>]*>(.*?)<\/div>/gi) || 
                           html.match(/<article[^>]*>(.*?)<\/article>/gi) ||
                           html.match(/<p[^>]*>([^<]+)<\/p>/gi);

      let content = "Full article content available at the source.";
      if (contentMatches && contentMatches.length > 0) {
        // Clean HTML tags and get text content
        content = contentMatches
          .slice(0, 3)
          .map((match: string) => match.replace(/<[^>]*>/g, "").trim())
          .filter((text: string) => text.length > 50)
          .join("\n\n");
      }

      // Extract meta description as fallback
      if (content.length < 100) {
        const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
        if (descMatch) {
          content = descMatch[1];
        }
      }

      // Extract images
      const imageMatches = html.match(/<img[^>]*src="([^"]+)"[^>]*>/gi) || [];
      interface ImageMatch {
        match: string;
        srcMatch: RegExpMatchArray | null;
        extractedSrc: string | null;
      }

      interface ProcessedImages {
        matches: string[];
        extractedSources: (string | null)[];
        filteredImages: string[];
      }

      const images: string[] = imageMatches
        .map((img: string): string | null => {
          const srcMatch: RegExpMatchArray | null = img.match(/src="([^"]+)"/i);
          return srcMatch ? srcMatch[1] : null;
        })
        .filter((src: string | null): src is string => src !== null && (src.includes("animenewsnetwork") || src.startsWith("http")))
        .slice(0, 5); // Limit to 5 images

      // Extract publish date
      const dateMatch = html.match(/<time[^>]*datetime="([^"]+)"/i) || html.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i);
      const publishDate = dateMatch ? dateMatch[1] : new Date().toISOString();

      return {
        title,
        content: content || "Click the source link to read the full article.",
        images,
        publishDate,
        author: "Anime News Network",
        tags: ["Anime", "News"],
      };
    } catch (error) {
      console.error("Error fetching news content:", error);
      throw new Error("Failed to load article content. Please visit the source link.");
    }
  }

  // Format date for display
  formatDate(pubDate: string): string {
    try {
      const date = new Date(pubDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return pubDate;
    }
  }

  // Extract excerpt from description
  extractExcerpt(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
  }

  // Get unique categories from news items
  getUniqueCategories(newsItems: NewsItem[]): string[] {
    const categories = newsItems.flatMap((item) => item.category);
    return [...new Set(categories)].sort();
  }

  // Filter news by category
  filterByCategory(newsItems: NewsItem[], category: string): NewsItem[] {
    return newsItems.filter((item) => item.category.some((cat: string) => cat.toLowerCase() === category.toLowerCase()));
  }

  // Search news items
  searchNews(newsItems: NewsItem[], query: string): NewsItem[] {
    const searchTerm = query.toLowerCase();
    return newsItems.filter(
      (item) => item.title.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm) || item.category.some((cat: string) => cat.toLowerCase().includes(searchTerm))
    );
  }
}

export const newsService = new NewsService();
