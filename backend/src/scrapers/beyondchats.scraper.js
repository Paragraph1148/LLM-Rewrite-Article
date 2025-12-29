import axios from "axios";
import * as cheerio from "cheerio";
import slugify from "slugify";

const BASE_URL = "https://beyondchats.com";
const BLOGS_URL = `${BASE_URL}/blogs/`;

/**
 * Extract article links from a blogs listing page.
 * Returns links in DOM order (top -> bottom).
 */
function extractArticleLinks($) {
  const links = [];

  $("article").each((_, el) => {
    const href = $(el).find("a").first().attr("href");

    if (href && href.startsWith(BASE_URL) && !href.includes("/page/")) {
      links.push(href);
    }
  });

  return links;
}

/**
 * Find the highest page number from pagination links.
 */
function detectLastPageNumber($) {
  let maxPage = 1;

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    const match = href && href.match(/\/blogs\/page\/(\d+)/);

    if (match) {
      const pageNum = parseInt(match[1], 10);
      if (pageNum > maxPage) {
        maxPage = pageNum;
      }
    }
  });

  return maxPage;
}

export async function scrapeOldestArticles() {
  // 1. Load main blogs page
  const mainRes = await axios.get(BLOGS_URL);
  const $main = cheerio.load(mainRes.data);

  // 2. Detect true last page
  const lastPageNumber = detectLastPageNumber($main);
  const lastPageUrl = `${BLOGS_URL}page/${lastPageNumber}/`;

  console.log("Detected last blogs page:", lastPageUrl);

  const collectedLinks = [];

  // 3. Fetch last page (oldest articles)
  const lastPageRes = await axios.get(lastPageUrl);
  const $last = cheerio.load(lastPageRes.data);

  const lastPageLinks = extractArticleLinks($last);
  collectedLinks.push(...lastPageLinks);

  // 4. If fewer than 5, fetch previous page and take from bottom
  if (collectedLinks.length < 5 && lastPageNumber > 1) {
    const prevPageUrl = `${BLOGS_URL}page/${lastPageNumber - 1}/`;
    const prevRes = await axios.get(prevPageUrl);
    const $prev = cheerio.load(prevRes.data);

    const prevLinks = extractArticleLinks($prev).reverse();
    collectedLinks.push(...prevLinks);
  }

  // 5. Take the oldest 5 overall
  const finalLinks = collectedLinks.slice(0, 5);

  const articles = [];

  // 6. Scrape individual articles
  for (const link of finalLinks) {
    try {
      const res = await axios.get(link);
      const $ = cheerio.load(res.data);

      const title = $("h1").first().text().trim();
      const content = $("article").text().trim();

      if (!title || !content) {
        continue;
      }

      articles.push({
        title,
        slug: slugify(title, { lower: true }),
        content,
        source_url: link,
      });
    } catch (err) {
      console.log(`Skipping article due to error: ${link}`);
    }
  }

  return articles;
}
