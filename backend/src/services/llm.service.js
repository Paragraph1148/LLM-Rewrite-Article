import axios from "axios";

/* Handles interaction with the LLM.
 * Takes original article and reference articles,
 * returns a rewritten version.
 */

export async function rewriteArticleWithLLM({
  originalArticle,
  referenceArticles,
}) {
  // TODO:
  // - Build controlled prompt
  // - Call LLM API
  // - Return rewritten content

  if (!originalArticle || !referenceArticles?.length) {
    return "";
  }

  const prompt = buildPrompt(originalArticle, referenceArticles);

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional content editor. You rewrite articles to improve clarity and structure without copying source material.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content?.trim();

    return content || "";
  } catch (err) {
    console.error("LLM rewrite failed:", err.message);
    return "";
  }
}

/**
 * Builds a controlled prompt for the LLM.
 * Keeping this separate makes it easier to tweak later.
 */
function buildPrompt(original, references) {
  const referenceText = references
    .map((ref, idx) => {
      return `Reference Article ${idx + 1}:\n${ref}`;
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

Formatting rules:
- Use clear headings and subheadings.
- Write in clean, readable markdown.
- Do not include a conclusion section unless it fits naturally.

Original Article:
${original}

${referenceText}
`;
}
