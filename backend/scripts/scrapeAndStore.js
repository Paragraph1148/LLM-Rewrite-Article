import axios from "axios";
import { scrapeOldestArticles } from "../src/scrapers/beyondchats.scraper.js";

const API_URL = "http://localhost:4000/api/articles";

async function scrapeAndStore() {
  const articles = await scrapeOldestArticles();

  if (!articles || articles.length === 0) {
    console.log("No articles found to store");
    return;
  }

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    try {
      await axios.post(API_URL, article);
      console.log(`Saved (${i + 1}/${articles.length}): ${article.title}`);
    } catch (err) {
      console.log(`Failed to save article: ${article.title}`);
    }
  }

  console.log("Scraping job finished");
}

scrapeAndStore()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Scraper failed:", err.message);
    process.exit(1);
  });
