// Create a new file: scripts/updateArticlesWithRateLimit.js
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { searchRelatedArticles } from "../src/services/search.service.js";
import { scrapeArticleContent } from "../src/services/scrape.service.js";
import { rewriteArticleWithLLM } from "../src/services/llm.service.js";

const API_BASE = "http://localhost:4000/api/articles";

async function fetchOriginalArticles() {
  const res = await axios.get(API_BASE);
  return res.data.filter((a) => a.is_updated === 0);
}

async function storeUpdatedArticle(original, newContent, references) {
  const payload = {
    title: original.title,
    content: newContent,
    is_updated: 1,
    reference_links: references,
  };

  await axios.put(`${API_BASE}/${original.id}`, payload);
}

// Rate limiter to avoid hitting Google's limits
class RateLimiter {
  constructor(requestsPerMinute = 15) {
    // Conservative limit for free tier
    this.requestsPerMinute = requestsPerMinute;
    this.requests = [];
  }

  async waitIfNeeded() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old requests
    this.requests = this.requests.filter((time) => time > oneMinuteAgo);

    // If we've hit the limit, wait
    if (this.requests.length >= this.requestsPerMinute) {
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest) + 1000; // Add 1 second buffer
      console.log(
        `Rate limit: Waiting ${Math.round(waitTime / 1000)} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Add this request
    this.requests.push(now);
  }
}

async function run() {
  console.log("Starting article update pipeline with rate limiting...");

  const articles = await fetchOriginalArticles();

  if (!articles.length) {
    console.log("No original articles found. Exiting.");
    return;
  }

  const rateLimiter = new RateLimiter(15); // 15 requests per minute max

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`\n(${i + 1}/${articles.length}) Processing: ${article.title}`);

    try {
      // Wait for rate limit
      await rateLimiter.waitIfNeeded();

      // Search related articles
      console.log("  Searching for related articles...");
      const links = await searchRelatedArticles(article.title);

      if (links.length < 2) {
        console.log("  Skipping: not enough reference articles found");
        continue;
      }

      // Scrape reference content
      console.log("  Scraping reference articles...");
      const referenceContents = [];

      for (const link of links) {
        await rateLimiter.waitIfNeeded(); // Add delay between scrapes too
        const content = await scrapeArticleContent(link);
        if (content) {
          referenceContents.push(content);
        }
      }

      if (referenceContents.length < 2) {
        console.log("  Skipping: failed to scrape references");
        continue;
      }

      // Call LLM to rewrite
      console.log("  Rewriting with Gemma 3 27B IT...");
      await rateLimiter.waitIfNeeded(); // Important: delay before LLM call

      const rewritten = await rewriteArticleWithLLM({
        originalArticle: article.content,
        referenceArticles: referenceContents,
      });

      if (!rewritten) {
        console.log("  Skipping: LLM rewrite failed");
        continue;
      }

      // Store updated article via API
      console.log("  Saving updated article...");
      await storeUpdatedArticle(article, rewritten, links);
      console.log("   Article updated successfully!");
    } catch (err) {
      console.log("   Error processing article:", err.message);

      // If it's a rate limit error, wait longer
      if (err.message.includes("429") || err.message.includes("rate limit")) {
        console.log("    Rate limit hit, waiting 60 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 60000));
      }
    }

    // Add delay between articles
    console.log("  Waiting 10 seconds before next article...");
    await new Promise((r) => setTimeout(r, 10000));
  }

  console.log("\n🎉 Phase 2 Pipeline completed successfully!");
}

run().catch((err) => {
  console.error("Pipeline failed:", err.message);
  process.exit(1);
});
