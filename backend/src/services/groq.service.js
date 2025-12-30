import axios from "axios";

/**
 * Uses Groq (OpenAI-compatible API) to rewrite an article
 * using reference articles as guidance.
 */
export async function rewriteArticleWithLLM({
  originalArticle,
  referenceArticles,
}) {
  if (!originalArticle || referenceArticles.length < 2) {
    return "";
  }

  const prompt = buildPrompt(originalArticle, referenceArticles);

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a professional editor rewriting blog articles for clarity and structure.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("LLM rewrite failed:", err.message);
    return "";
  }
}

function buildPrompt(original, references) {
  const originalText =
    original.length > 6000 ? original.slice(0, 6000) : original;

  const referenceText = references
    .map((ref, i) => {
      const text = ref.length > 3000 ? ref.slice(0, 3000) : ref;
      return `Reference ${i + 1}:\n${text}`;
    })
    .join("\n\n");

  return `
You are given an original blog article and two reference articles.

Your task:
- Rewrite the original article to improve clarity, structure, and depth.
- Keep the original intent and topic.
- Use the reference articles only as guidance for tone and structure.
- Do NOT copy sentences or phrases from the reference articles.
- Do NOT mention the reference articles in the body.
- Do NOT include phrases like "Based on the article" or "According to the reference".

Formatting rules:
- Use clear headings and subheadings (## for main headings, ### for subheadings).
- Write in clean, readable markdown.
- Do not include a conclusion section unless it fits naturally.
- Keep the article length similar to the original (not too short, not too long).
- Write in a professional, engaging style suitable for a business blog.

Original Article:
${truncatedOriginal}

${referenceText}

Please rewrite the original article following the instructions above:
`;
}
