import { useEffect, useState } from "react";
import axios from "axios";
import ArticlePair from "./components/ArticlePair";

const API_URL = `${
  import.meta.env.DB_URL || "http://localhost:4000"
}/api/articles`;

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await axios.get(API_URL);
        setArticles(res.data);
      } catch (err) {
        console.error("Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading articles...</p>;
  }

  // group by title
  const grouped = {};

  articles.forEach((article) => {
    if (!grouped[article.title]) {
      grouped[article.title] = {};
    }

    if (article.is_updated) {
      grouped[article.title].updated = article;
    } else {
      grouped[article.title].original = article;
    }
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <h1>BeyondChats Article Comparison</h1>

      {Object.entries(grouped).map(([title, pair]) => (
        <ArticlePair key={title} pair={pair} />
      ))}
    </div>
  );
}

export default App;
