const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.post("/api/milk-recommendation", async (req, res) => {
  const { messages } = req.body;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 500,
        messages
      })
    });

    const data = await openaiRes.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error calling OpenAI:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});