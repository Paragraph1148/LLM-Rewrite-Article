import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { searchRelatedArticles } from "../src/services/search.service.js";
import { scrapeArticleContent } from "../src/services/scrape.service.js";
import { rewriteArticleWithLLM } from "../src/services/groq.service.js";

const API_BASE = "https://llm-rewrite-article.onrender.com/api/articles";

async function fetchOriginalArticles() {
  const res = await axios.get(API_BASE);
  return res.data.filter((a) => a.is_updated === 0);
}

async function storeUpdatedArticle(original, content, references) {
  // await axios.put(`${API_BASE}/${original.id}`, {
  //   title: original.title,
  //   content,
  //   is_updated: 1,
  //   reference_links: references,
  // });
  await axios.post(API_BASE, {
    title: original.title,
    content: rewritten,
    is_updated: 1,
    reference_links: links,
    source_url: original.source_url,
  });
}

async function run() {
  console.log("Starting Phase 2 pipeline...\n");

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY not set");
    return;
  }

  const articles = await fetchOriginalArticles();

  if (!articles.length) {
    console.log("No original articles found.");
    return;
  }

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`(${i + 1}/${articles.length}) ${article.title}`);

    try {
      const links = await searchRelatedArticles(article.title);
      if (links.length < 2) {
        console.log("  Skipped: not enough reference articles\n");
        continue;
      }

      const references = [];
      for (const link of links) {
        const text = await scrapeArticleContent(link);
        if (text) references.push(text);
      }

      if (references.length < 2) {
        console.log("  Skipped: could not scrape references\n");
        continue;
      }

      const rewritten = await rewriteArticleWithLLM({
        originalArticle: article.content,
        referenceArticles: references,
      });

      if (!rewritten) {
        console.log("  Skipped: LLM rewrite failed\n");
        continue;
      }

      await storeUpdatedArticle(article, rewritten, links);
      console.log("  Updated article saved\n");
    } catch (err) {
      console.log("  Error:", err.message, "\n");
    }

    // small delay to avoid hitting free-tier limits
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log("Phase 2 pipeline completed.");
}

run().catch((err) => {
  console.error("Pipeline failed:", err.message);
  process.exit(1);
});
