// V6 AI BACKEND - OPENAI

import OpenAI from "openai";

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

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing in Vercel."
      });
    }

    const { question } = req.body || {};

    if (!question || !String(question).trim()) {
      return res.status(400).json({
        error: "Question is required."
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: String(question).trim()
    });

    const answer = response.output_text;

    if (!answer) {
      return res.status(500).json({
        error: "AI returned an empty response."
      });
    }

    return res.status(200).json({
      answer: answer
    });

  } catch (error) {

    console.error("V6 OpenAI Error:", error);

    return res.status(500).json({
      error: error?.message || "OpenAI request failed."
    });
  }
}
