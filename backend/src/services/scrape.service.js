import axios from "axios";
import cheerio from "cheerio";

/* Scrapes main readable content from external blog/article pages.
 * Keeps extraction logic simple and defensive.
 */

export async function scrapeArticleContent(url) {
  // TODO:
  // - Fetch page HTML
  // - Extract main article content
  // - Return cleaned text

  if (!url) return "";

  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: {
        // some sites block default user agents
        "User-Agent": "Mozilla/5.0 (compatible; BeyondChatsBot/1.0)",
      },
    });

    const $ = cheerio.load(res.data);

    let content = "";

    // try common article containers first
    const selectors = [
      "article",
      "main",
      ".post-content",
      ".article-content",
      ".entry-content",
    ];

    for (const selector of selectors) {
      const text = $(selector).text().trim();
      if (text && text.length > content.length) {
        content = text;
      }
    }

    // fallback: grab all paragraphs
    if (!content) {
      const paragraphs = [];
      $("p").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 50) {
          paragraphs.push(text);
        }
      });
      content = paragraphs.join("\n\n");
    }
    if (content.length > 8000) {
      content = content.slice(0, 8000);
    }

    return content;
  } catch (err) {
    console.error(`Failed to scrape ${url}:`, err.message);
    return "";
  }
}
