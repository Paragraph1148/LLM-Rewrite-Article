import ArticleCard from "./ArticleCard";

function ArticleList({ articles }) {
  const originals = articles.filter((a) => a.is_updated === 0);
  const updates = articles.filter((a) => a.is_updated === 1);

  return (
    <>
      <h2>Original Articles</h2>
      {originals.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      <h2 style={{ marginTop: 40 }}>Updated Articles</h2>
      {updates.map((article) => (
        <ArticleCard key={article.id} article={article} showReferences />
      ))}
    </>
  );
}

export default ArticleList;
