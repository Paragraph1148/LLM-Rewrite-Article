import { useState } from "react";

function ArticleCard({ article, label, showReferences = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!article) return null;

  // ---------- Normalise reference_links ----------
  const refs = Array.isArray(article.reference_links)
    ? article.reference_links
    : typeof article.reference_links === "string"
    ? article.reference_links
        .split(/\s*,\s*/) // split on commas (optional spaces)
        .filter(Boolean) // drop empty strings
    : [];

  return (
    <div
      style={{
        flex: 1,
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        background: "#fff",
      }}
    >
      <h3>{label}</h3>
      <h4 style={{ marginTop: 0 }}>{article.title}</h4>

      <p style={{ whiteSpace: "pre-line" }}>
        {expanded ? article.content : article.content.slice(0, 400) + "..."}
      </p>

      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? "Show less" : "Read more"}
      </button>

      {/* ---------- Render references only when we have them ---------- */}
      {showReferences && refs.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>References</h4>
          <ul>
            {refs.map((link, idx) => (
              <li key={idx}>
                <a href={link} target="_blank" rel="noreferrer">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ArticleCard;
