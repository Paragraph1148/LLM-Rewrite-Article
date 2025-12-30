import axios from "axios";

/* Responsible for searching the web for related articles.
 * This will be implemented using a search API for stability.
 */

export async function searchRelatedArticles(query) {
  // TODO done:
  // - Call search API
  // - Filter results to blog/article pages
  // - Return top 2 relevant links

  if (!query) return [];
  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        q: query,
        api_key: process.env.SEARCH_API_KEY,
        num: 10,
      },
    });

    const results = response.data.organic_results || [];
    const links = [];

    for (const result of results) {
      if (!result.link) continue;
      if (
        !result.link.endsWith(".pdf") &&
        !result.link.includes("facebook.com")
      ) {
        links.push(result.link);
      }

      if (links.length === 2) break;
    }

    return links;
  } catch (err) {
    console.error("Search failed:", err.message);
    return [];
  }
}
