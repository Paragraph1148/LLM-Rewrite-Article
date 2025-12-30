import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function testGemmaModel() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;

  if (!apiKey) {
    console.error("❌ No API key found in environment variables.");
    return;
  }

  console.log(`🔑 API key (first 10 chars): ${apiKey.substring(0, 10)}...\n`);

  // Test 1: Direct API call to check model availability and billing
  console.log(
    "🧪 Test 1: Checking model availability and billing requirements..."
  );

  try {
    // Direct API call to get model info
    const modelInfoResponse = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it?key=${apiKey}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("✅ Model is available in your region");
    console.log("📋 Model Details:");
    console.log(`   Name: ${modelInfoResponse.data.name}`);
    console.log(`   Display Name: ${modelInfoResponse.data.displayName}`);
    console.log(
      `   Description: ${modelInfoResponse.data.description || "N/A"}`
    );
    console.log(
      `   Input Token Limit: ${modelInfoResponse.data.inputTokenLimit || "N/A"}`
    );
    console.log(
      `   Output Token Limit: ${
        modelInfoResponse.data.outputTokenLimit || "N/A"
      }`
    );
    console.log(
      `   Temperature: ${modelInfoResponse.data.temperature || "N/A"}`
    );

    // Check if model is tuned (might indicate paid tier)
    if (modelInfoResponse.data.tunedModel) {
      console.log(
        "⚠️  This appears to be a tuned/fine-tuned model (might require billing)"
      );
    }
  } catch (error) {
    console.log("❌ Error getting model info:");
    console.log(`   Status: ${error.response?.status}`);
    console.log(
      `   Error: ${error.response?.data?.error?.message || error.message}`
    );

    if (error.response?.status === 403) {
      console.log(
        "⚠️  Permission denied - might require project approval or billing"
      );
    } else if (error.response?.status === 404) {
      console.log(
        "⚠️  Model not found - might not be available in your region"
      );
    }
  }

  console.log("\n🧪 Test 2: Testing generation with different prompts...");

  // Test with different prompt lengths and complexities
  const testPrompts = [
    { name: "Short prompt", text: "Say hello in one sentence." },
    {
      name: "Medium prompt",
      text: "Write a 2-sentence introduction to artificial intelligence.",
    },
    {
      name: "Long prompt",
      text: "Explain the concept of machine learning in about 100 words, focusing on supervised learning.",
    },
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  let successfulTests = 0;

  for (const promptTest of testPrompts) {
    try {
      console.log(`\n   Testing: ${promptTest.name}`);
      console.log(
        `   Prompt: "${promptTest.text.substring(0, 50)}${
          promptTest.text.length > 50 ? "..." : ""
        }"`
      );

      const model = genAI.getGenerativeModel({
        model: "gemma-3-27b-it",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        },
      });

      const startTime = Date.now();
      const result = await model.generateContent(promptTest.text);
      const endTime = Date.now();

      const response = await result.response;
      const text = response.text();
      const duration = endTime - startTime;

      console.log(
        `   ✅ Success! Response (${text.length} chars): ${text.substring(
          0,
          100
        )}...`
      );
      console.log(`   ⏱️  Response time: ${duration}ms`);

      successfulTests++;

      // Check for billing/rate limit indicators in response
      if (
        text.includes("billing") ||
        text.includes("payment") ||
        text.includes("subscription")
      ) {
        console.log(
          "   ⚠️  Warning: Response contains billing-related keywords"
        );
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message.split("\n")[0]}`);

      // Analyze the error for billing indicators
      const errorMessage = error.message.toLowerCase();
      const errorResponse = error.response?.data;

      if (
        errorMessage.includes("billing") ||
        errorMessage.includes("payment") ||
        errorMessage.includes("subscription") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit")
      ) {
        console.log("   💰 This error suggests billing/rate limit issues");
      }

      if (errorResponse?.error) {
        console.log(
          "   🔍 Error details:",
          JSON.stringify(errorResponse.error, null, 2)
        );
      }

      // Check specific error codes
      if (error.response?.status === 429) {
        console.log("   🚫 Rate limited - too many requests");
      } else if (error.response?.status === 403) {
        console.log("   🔒 Access forbidden - check billing and permissions");
      } else if (error.response?.status === 402) {
        console.log("   💳 Payment required - billing setup needed");
      }
    }

    // Wait between tests to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n🧪 Test 3: Checking usage and quotas...");

  try {
    // Try to get usage information (if available)
    const usageResponse = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:countTokens?key=${apiKey}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          contents: [
            {
              parts: [
                {
                  text: "Test message to count tokens",
                },
              ],
            },
          ],
        },
      }
    );

    console.log("✅ Token counting is available");
    console.log(`   Tokens: ${usageResponse.data?.totalTokens || "N/A"}`);
  } catch (error) {
    console.log("❌ Cannot check token usage:");
    console.log(
      `   Error: ${error.response?.data?.error?.message || error.message}`
    );
  }

  console.log("\n🧪 Test 4: Testing with streaming (if available)...");

  try {
    const model = genAI.getGenerativeModel({
      model: "gemma-3-27b-it",
    });

    console.log("   Testing streaming response...");
    const streamingResult = await model.generateContentStream("What is 2+2?");

    let streamedText = "";
    for await (const chunk of streamingResult.stream) {
      const chunkText = chunk.text();
      streamedText += chunkText;
      process.stdout.write("."); // Show progress
    }

    console.log(
      `\n   ✅ Streaming works! Response: ${streamedText.substring(0, 100)}...`
    );
  } catch (error) {
    console.log(`   ❌ Streaming failed: ${error.message.split("\n")[0]}`);
    if (error.message.includes("stream")) {
      console.log(
        "   ℹ️  Streaming might not be available for this model or tier"
      );
    }
  }

  console.log("\n📊 Test Summary:");
  console.log(`   Total tests attempted: ${testPrompts.length}`);
  console.log(`   Successful generations: ${successfulTests}`);
  console.log(
    `   Success rate: ${Math.round(
      (successfulTests / testPrompts.length) * 100
    )}%`
  );

  if (successfulTests === testPrompts.length) {
    console.log("\n🎉 Gemma 3 27B IT appears to be working with your API key!");
    console.log("💡 Recommendations:");
    console.log("   1. Update llm.service.js to use 'gemma-3-27b-it'");
    console.log("   2. Add error handling for potential rate limits");
    console.log("   3. Consider implementing retry logic");
  } else if (successfulTests > 0) {
    console.log("\n⚠️  Gemma 3 27B IT works but with limitations");
    console.log("💡 Recommendations:");
    console.log(
      "   1. You might be hitting rate limits - add delays between requests"
    );
    console.log("   2. Check if you need to enable billing for higher quotas");
    console.log("   3. Consider using a different model for production");
  } else {
    console.log("\n❌ Gemma 3 27B IT is not working with your current setup");
    console.log("💡 Next steps:");
    console.log("   1. Get a new API key from Google AI Studio");
    console.log("   2. Check if billing is required for this model");
    console.log(
      "   3. Try alternative models: gemini-2.0-flash, gemini-pro-latest"
    );
    console.log("   4. Consider switching to OpenAI or another provider");
  }

  // Additional check: Test if other models work for comparison
  console.log("\n🔍 Comparison: Testing other available models...");

  const comparisonModels = [
    "gemini-2.0-flash",
    "gemini-pro-latest",
    "gemma-3-12b-it",
  ];

  for (const modelName of comparisonModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      const response = await result.response;

      console.log(`   ✅ ${modelName}: Works`);
    } catch (error) {
      console.log(`   ❌ ${modelName}: ${error.message.split("[")[0]}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Run the comprehensive test
testGemmaModel().catch(console.error);
