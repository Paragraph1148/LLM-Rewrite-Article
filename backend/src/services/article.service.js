import pool from "../db/index.js";

export async function createArticle(data) {
  const { title, slug, content, source_url, is_updated, reference_links } =
    data;

  const [result] = await pool.query(
    `INSERT INTO articles (title, slug, content, source_url, is_updated, reference_links)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      title,
      slug,
      content,
      source_url,
      is_updated || 0,
      reference_links ? JSON.stringify(reference_links) : null,
    ]
  );
  return result.insertId;
}

export async function getAllArticles() {
  const [rows] = await pool.query(
    `SELECT * FROM articles ORDER BY created_at DESC`
  );

  return rows;
}

export async function getArticleById(id) {
  const [rows] = await pool.query(`SELECT * FROM articles WHERE id = ?`, [id]);

  return rows[0];
}

export async function updateArticle(id, data) {
  const { title, content, is_updated, reference_links } = data;

  await pool.query(
    `UPDATE articles
    SET title = ?, content = ?, is_updated = ?, reference_links = ?
    WHERE id = ?`,
    [title, content, is_updated, JSON.stringify(reference_links), id]
  );
}

export async function deleteArticle(id) {
  await pool.query(`DELETE FROM articles WHERE id = ?`, [id]);
}
