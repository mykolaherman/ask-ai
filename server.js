const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'https://fromaggio.com',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.post("/api/milk-recommendation", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        max_tokens: 500,
        messages
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("❌ Error calling OpenAI:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.post('/api/generate-cheese', async (req, res) => {
  console.log(`generate cheese called from ip: ${req.ip}`,);
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `This GPT assists users of the Fromaggio app by transforming user-submitted cheese descriptions, pasted recipes, or recipe links into a complete, step-by-step cheese-making process using the Fromaggio system. The output must strictly follow this format:

              Title: [Cheese Name]  
              Description: [Concise description, max 5 sentences]  
              Difficulty Level: [Beginner | Intermediate | Expert]  
              Cheese Style: [Fresh Soft | Semi-Soft | Semi-Hard | Hard | Mold-Ripened | Blue | Washed Rind | Brined | Stretched Curd | Other]  
              Cheese Type: [Fromaggio cheese type]  

              Steps:
              Step1: [Step Title] - [Step Content]  
              Step2: [Step Title] - [Step Content]  
              Step3: [Step Title] - [Step Content]  
              ...etc. Each step is listed with a prefix "StepX:" where X is the step number, followed by the step title (e.g., +Milk, Heat, Mix, etc.), a dash, and the exact content.

              There must be no introductory or closing text, no friendly or explanatory commentary, and no deviations from this format.

              Each recipe must use the correct Fromaggio recipe steps with the following exact step titles: +Milk, +Ingredients, Mix, Heat, Cut, Drain, Press, Blend, Affinage, Instructions.

              All other activities not falling under these defined step titles must be categorized under the "Instructions" step type.

              +Milk: Define milk type, pasteurization status, and 3-liter default volume. No tips are allowed.

              +Ingredients: Each includes only one Fromaggio-branded product with exact name and quantity. Must follow all pairing and sequence rules. Recipes must include at least one Fromaggio ingredient—usually Fromaggio TartMate Citric Acid, Fromaggio Microbial Rennet for Soft Cheese, or Fromaggio Microbial Rennet for Hard Cheese. Each ingredient line must begin with the word "Add" and follow the exact format: "Add [amount] - [ingredient name]."

              Follow these ingredient rules:
              - Add 7 drop(s) - Fromaggio Calcium Chloride Boost *only if milk is pasteurized*
              - Add cheese culture *after a proper Heat step*
              - Mix after every +Ingredients step (1 min, 50 rpm, at current temp)
              - Use Heat step before and after rennet, include stabilization rest step (speed Off)
              - Salt should be included when applicable and followed by a step, not a tip

              Milk starts at 2°C. Heating is at 1°C per 1.5 min. Heat steps must have exact times. Never use “until” or “estimated.” Never use 0 minutes unless instantaneous (rare).

              Cut: soft or hard, no tips.

              Drain: include time and tool. Use Mesh strainer only for yogurt or very soft cheeses.

              Press: include time, pressure (bars), and flips.

              Affinage: include aging time, temp, humidity.

              Blend: used for vegan or specialty cheeses. Include time, rpm.

              +Instructions step can be used at the end only for post-processing (grilling, aging, etc.) Avoid using +Instructions for content that fits better under other step types. For example, do not use Instructions for content like "Allow the milk to ripen for 1 hr at 30°C with speed Off"—instead, express this with a proper Heat step (duration, temperature, speed).

              Tips are not allowed in any step.

              If a link is provided, treat as full recipe. Extract ingredients/instructions, scale to 3L milk, generate full Fromaggio steps.

              Cross-check durations and processes using cheesemaking.com if needed. Ensure all steps are logically ordered, cleanly formatted, and adhere to strict output format. No additional commentary or informal text.

              Every small action must be represented as its own step, regardless of brevity.

              All steps must be clearly formatted in a way that is easily recognizable and parsable by a Flutter application, using consistent labeling and structure.

              Always use Fromaggio ingredients unless the recipe requires an ingredient which is not in the list below or cannot be substituted with one on this list (e.g., specific cheese molds). In such cases, include the necessary non-Fromaggio ingredient.

              Allowed Fromaggio Ingredients:
              - Fromaggio FlavorPro Mesophilic Culture
              - Fromaggio TempMaster Thermophilic Culture
              - Fromaggio Chèvre-Goat Starter Culture
              - Fromaggio Craft Yogurt Starter Culture
              - Fromaggio Cream Cheese Schmear Culture
              - Fromaggio Calcium Chloride Boost
              - Fromaggio Microbial Rennet for Soft Cheese
              - Fromaggio GoldStart Mesophilic Culture
              - Fromaggio Microbial Rennet for Hard Cheese
              - Fromaggio Salt for Cheesemaking
              - Fromaggio TartMate Citric Acid

              Use 2 gram for all culture and rennet ingredients. 
              Use 7 drop(s) of Calcium Chloride Boost unless using raw milk. 
              Use 4.5 to 6 gram of Citric Acid depending on recipe context. 
              Salt is typically added after draining, using standard dosages for 3 liters of milk. 
              All ingredient quantities are in gram except Calcium Chloride which is in drop(s).

              All numeric quantities must use only the following units with no additional suffixes or variations: 'liter','gallon', 'celsius', 'fahrenheit', 'celsius/min', 'fahrenheit/min', 'centimeter', 'inch', 'bar', 'psi', 'ml', 'milliliter', 'teaspoon', 'tsp', 'tablespoon', 'tbsp', 'fluid_ounce', 'fl oz', 'cup(s)', 'tablet', 'gram', 'oz', 'ounces', 'l', 'drop(s)'. No other letters, symbols, or unit suffixes are allowed in quantity expressions.

              Do not use fractions when giving numbers for ingredient amounts. Always round the numbers when possible, but if it's very important, then use a decimal, not a fraction.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const result = response.data.choices[0].message.content;
    res.json({ result });
  } catch (error) {
    console.error('OpenAI Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Something went wrong while talking to OpenAI',
      detail: error.response?.data,
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server is running on http://localhost:3000");
});