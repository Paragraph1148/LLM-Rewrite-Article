import ArticleCard from "./ArticleCard";

function ArticlePair({ pair }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        marginBottom: 40,
        alignItems: "stretch",
      }}
    >
      <ArticleCard article={pair.original} label="Original Article" />

      {pair.updated ? (
        <ArticleCard
          article={pair.updated}
          label="Updated Article"
          showReferences
        />
      ) : (
        <div
          style={{
            flex: 1,
            border: "1px dashed #ccc",
            borderRadius: 8,
            padding: 16,
            color: "#777",
          }}
        >
          <h3>Updated Article</h3>
          <p>Not updated yet.</p>
        </div>
      )}
    </div>
  );
}

export default ArticlePair;
