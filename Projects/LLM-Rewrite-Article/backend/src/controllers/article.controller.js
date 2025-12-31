import * as ArticleService from "../services/article.service.js";

export async function create(req, res) {
  try {
    const id = await ArticleService.createArticle(req.body);
    console.log("BODY:", req.body);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAll(req, res) {
  try {
    const articles = await ArticleService.getAllArticles();

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getById(req, res) {
  try {
    const article = await ArticleService.getArticleById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req, res) {
  try {
    await ArticleService.updateArticle(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    await ArticleService.deleteArticle(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
