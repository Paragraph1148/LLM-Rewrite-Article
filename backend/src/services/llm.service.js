import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* Handles interaction with the LLM.
 * Takes original article and reference articles,
 * returns a rewritten version.
 */

export async function rewriteArticleWithLLM({
  originalArticle,
  referenceArticles,
}) {
  if (!originalArticle || referenceArticles.length < 2) {
    return "";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemma-3-27b-it",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    const prompt = buildPrompt(originalArticle, referenceArticles);
    console.log("Sending prompt to Gemma 3 27B IT...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "";
  } catch (err) {
    console.error("Gemma rewrite failed:", err.message);

    // Check if it's a rate limit error
    if (err.message.includes("429") || err.message.includes("rate limit")) {
      console.log("Rate limit hit. Consider adding delays between requests.");
    }

    // Check if it's an API key error
    if (err.message.includes("API key not valid")) {
      console.log("API key issue. Verify your key is still valid.");
    }

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
