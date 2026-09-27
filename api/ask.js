// V6 AI BACKEND - OPENAI SYNC
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  // CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://azmatwattoo.github.io"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Browser preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { question } = req.body || {};

    // Check question
    if (!question || !String(question).trim()) {
      return res.status(400).json({
        error: "Question is required."
      });
    }

    const cleanQuestion = String(question).trim();

    // AI models
    const models = [
      "gpt-5.6-sol",
      "gpt-5.6-terra",
      "gpt-5.6-luna"
    ];

    let lastError = null;

    // Try each model
    for (const model of models) {

      // Try each model twice
      for (let attempt = 1; attempt <= 2; attempt++) {

        try {

          console.log(
            `V6 AI: Trying ${model}, attempt ${attempt}`
          );

          const response =
            await openai.responses.create({
              model: model,
              input: cleanQuestion
            });

          const answer = response.output_text;

          if (!answer) {
            throw new Error("AI returned an empty response.");
          }

          console.log(
            `V6 AI: Success using ${model}`
          );

          return res.status(200).json({
            answer: answer
          });

        } catch (error) {

          lastError = error;

          console.log(
            `V6 AI error - ${model}, attempt ${attempt}:`,
            error.message
          );

          // Retry after 2 seconds
          if (attempt < 2) {
            await new Promise(resolve =>
              setTimeout(resolve, 2000)
            );
          }
        }
      }
    }

    // All models failed
    return res.status(503).json({
      error:
        lastError?.message ||
        "All AI models are temporarily unavailable."
    });

  } catch (error) {

    console.error(
      "V6 AI Backend Error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "AI request failed."
    });
  }
}
