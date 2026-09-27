import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { question } = req.body || {};

    if (!question) {
      return res.status(400).json({
        error: "Question is required."
      });
    }

    const models = [
      "gpt-5.6-sol",
      "gpt-5.6-terra",
      "gpt-5.6-luna"
    ];

    let lastError = null;

    for (const model of models) {

      for (let attempt = 1; attempt <= 2; attempt++) {

        try {

          const response = await openai.responses.create({
            model: model,
            input: question
          });

          return res.status(200).json({
            answer: response.output_text
          });

        } catch (error) {

          lastError = error;

          console.log(
            `Model ${model}, attempt ${attempt} failed:`,
            error.message
          );

          // Wait 2 seconds before retry
          if (attempt < 2) {
            await new Promise(resolve =>
              setTimeout(resolve, 2000)
            );
          }

        }

      }

    }

    return res.status(503).json({
      error: lastError?.message || "All AI models are temporarily unavailable."
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message || "AI request failed."
    });

  }

}
