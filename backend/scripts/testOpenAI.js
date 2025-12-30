import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say hello in one sentence." }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response:", res.data.choices[0].message.content);
  } catch (err) {
    console.error("Error:", err.response?.status, err.response?.data);
  }
}

test();
