import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

async function testGroq() {
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY not found in .env");
    return;
  }

  console.log("Testing Groq API...");

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: "Say hello in one sentence.",
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Groq API is working!");
    console.log("Response:", response.data.choices[0].message.content);
    console.log("Model:", response.data.model);
    console.log("Tokens used:", response.data.usage);
  } catch (error) {
    console.error("❌ Groq API test failed:");
    console.error("Status:", error.response?.status);
    console.error("Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log(
        "\n💡 Get a free API key from: https://console.groq.com/keys"
      );
    }
  }
}

testGroq();
