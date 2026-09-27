// V6 AI BACKEND
// Gemini Primary + OpenRouter Free Backup

export default async function handler(req, res) {

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

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { question } = req.body || {};

    if (!question || !String(question).trim()) {
      return res.status(400).json({
        error: "Question is required."
      });
    }

    const userQuestion = String(question).trim();

    // ==========================================
    // 1. TRY GEMINI FIRST
    // ==========================================

    if (process.env.GEMINI_API_KEY) {

      try {

        const geminiResponse = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": process.env.GEMINI_API_KEY
            },

            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: userQuestion
                    }
                  ]
                }
              ]
            })
          }
        );

        const geminiData =
          await geminiResponse.json();

        if (geminiResponse.ok) {

          const geminiAnswer =
            geminiData?.candidates?.[0]
              ?.content?.parts?.[0]?.text;

          if (geminiAnswer) {

            return res.status(200).json({
              answer: geminiAnswer,
              provider: "Gemini"
            });

          }

        }

        console.log(
          "Gemini unavailable. Trying OpenRouter backup."
        );

      } catch (geminiError) {

        console.log(
          "Gemini failed:",
          geminiError?.message
        );

      }

    }

    // ==========================================
    // 2. OPENROUTER FREE BACKUP
    // ==========================================

    if (process.env.OPENROUTER_API_KEY) {

      try {

        const openRouterResponse = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",

              "Authorization":
                `Bearer ${process.env.OPENROUTER_API_KEY}`,

              "HTTP-Referer":
                "https://azmatwattoo.github.io/Voice-command-ai/",

              "X-Title":
                "Voice Command AI V6"
            },

            body: JSON.stringify({

              model: "openrouter/free",

              messages: [
                {
                  role: "user",
                  content: userQuestion
                }
              ]

            })
          }
        );

        const openRouterData =
          await openRouterResponse.json();

        if (openRouterResponse.ok) {

          const openRouterAnswer =
            openRouterData
              ?.choices?.[0]
              ?.message
              ?.content;

          if (openRouterAnswer) {

            return res.status(200).json({
              answer: openRouterAnswer,
              provider: "OpenRouter"
            });

          }

        }

        console.log(
          "OpenRouter backup also failed."
        );

      } catch (openRouterError) {

        console.log(
          "OpenRouter failed:",
          openRouterError?.message
        );

      }

    }

    // ==========================================
    // 3. BOTH AI PROVIDERS FAILED
    // ==========================================

    return res.status(503).json({

      error:
        "AI is temporarily unavailable. Please try again later."

    });

  } catch (error) {

    console.error(
      "Backend Error:",
      error
    );

    return res.status(500).json({

      error:
        "AI backend error. Please try again later."

    });

  }

}
