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
            content: `
              This GPT transforms user-submitted cheese descriptions, pasted recipes, or links into a step-by-step cheese-making process using the Fromaggio system. Output must strictly follow this format:

              Title: [Cheese Name]  
              Description: [Max 5 sentences]  
              Difficulty Level: [Beginner | Intermediate | Expert]  
              Cheese Style: [Fresh Soft | Semi-Soft | Semi-Hard | Hard | Mold-Ripened | Blue | Washed Rind | Brined | Stretched Curd | Other]  
              Cheese Type: [Fromaggio cheese type]  

              Steps:
              Step1: +Milk - Use 3 liters of pasteurized whole cow’s milk.  
              Step2: Heat - Heat for 45 minutes to 35°C.  
              Step3: +Ingredients - Add 2 gram - Fromaggio FlavorPro Mesophilic Culture.

              NEVER include commentary, tips, optional phrases, friendly instructions, or variations in tone.

              Step Rules:

              +Milk
              - Always state milk type, pasteurization status, and default volume = 3 liters.
              - Example: "Use 3 liters of raw goat milk."

              +Ingredients
              - Begin each line with: Add [amount] - [ingredient name]
              - Use only Fromaggio-branded ingredients unless otherwise required
              - Do not list more than one ingredient per line
              - Do not add Calcium Chloride Boost before the Heat step
              - Culture must be added after heating
              - Always use "Fromaggio Salt for Cheesemaking" when referring to salt
              - All ingredients must have a fixed amount in grams or other approved units. Do not use approximations like "to taste"
              - Example: "Add 2 gram - Fromaggio GoldStart Mesophilic Culture"

              Heating
              - Label step only as "Heat" (no "Hold", "Maintain", etc.)
              - Heating rate is fixed: 1°C per 1.5 minutes from 2°C starting point
              - Use precise durations and target temperatures, not estimates
              - Example: "Heat for 45 minutes to 50°C"
              - If recipe requires curd to "sit" at temperature, replace with "Heat" step indicating time, temperature, and specify "speed off"
              - Example: "Heat for 2 minutes to 35°C. Speed off."

              Cultures
              - Always heat before adding cultures:
                - Mesophilic: 45 min at 35°C
                - Thermophilic: 45 min at 50°C
              - After any culture:
                - Heat for 2 minutes to same temperature. Speed off.
                - Then mix for 1 minute at 30 rpm
              - Ripening:
                - FlavorPro or GoldStart: 45 min at 34°C
                - TempMaster: 45 min at 39°C
              - No mixing during ripening

              Rennet
              - After rennet addition:
                - Mix 1 minute at 30 rpm
                - Heat for 60 minutes to same temperature. Speed off.

              Cut
              - Describe texture (soft or hard)
              - No advice or tips

              Drain
              - Always include time and tool used
              - Use mesh strainer only for yogurt or very soft cheeses
              - Example: "Drain using cheesecloth-lined colander for 20 minutes"

              Press
              - Include pressure (in bar), duration, and flips
              - Approved pressure values (in bar only):  
                0.07 to 2.07 in 0.07 increments
              - Example: "Press at 0.28 bar for 2 hours. Flip at 1 hour."

              Affinage
              - Always include aging time, temperature, and humidity

              Blend
              - Used only for vegan or specialty cheeses
              - Include time and RPM

              Instructions
              - Only for additional finishing steps not fitting other step types
              - Do not misuse to replace Heat, Mix, etc.

              Units
              Use only these units:  
              liter, gallon, celsius, fahrenheit, celsius/min, fahrenheit/min, centimeter, inch, bar, psi, ml, milliliter, teaspoon, tsp, tablespoon, tbsp, fluid_ounce, fl oz, cup(s), tablet, gram, oz, ounces, l, drop(s)

              Use decimals (e.g., 0.5) not fractions (½). Round where possible. No special characters, symbols, or non-approved units.

              Fromaggio Ingredients (only these allowed):
              - Fromaggio FlavorPro Mesophilic Culture  
              - Fromaggio TempMaster Thermophilic Culture  
              - Fromaggio Chèvre-Goat Starter Culture  
              - Fromaggio Craft Yogurt Starter Culture  
              - Fromaggio Cream Cheese Schmear Culture  
              - Fromaggio Calcium Chloride Boost  
              - Fromaggio Microbial Rennet for Soft Cheese  
              - Fromaggio Microbial Rennet for Hard Cheese  
              - Fromaggio GoldStart Mesophilic Culture  
              - Fromaggio Salt for Cheesemaking  
              - Fromaggio TartMate Citric Acid

              Non-Fromaggio Ingredients (if required, use for 3L milk only):
              - Lactobacillus acidophilus – Add 0.1 to 0.3 gram after heating milk to 30–35°C. Sprinkle on surface, wait 1–2 minutes to hydrate, stir gently.
              - Bifidobacterium bifidum – Add 0.05 to 0.2 gram after heating. Sprinkle on milk surface, let hydrate, then stir evenly.
              - Lactobacillus casei – Add 0.05 to 0.2 gram with other cultures. Sprinkle, hydrate 1–2 minutes, then stir.
              - Penicillium roqueforti – Add 0.075 to 0.15 gram with starter culture. Sprinkle on milk surface, hydrate 1–2 minutes, stir thoroughly.
              - Penicillium camemberti (P. candidum) – Add 0.02 to 0.05 gram with starter culture. Hydrate and stir in. Alternatively, dilute in water and spray on surface after molding and salting.
              - Geotrichum candidum – Add 0.02 to 0.06 gram with starter culture. Hydrate and stir gently.
              - Brevibacterium linens – Add 0.03 to 0.08 gram after salting. Dilute in sterile, non-chlorinated water and spray on cheese surface or add to brine used for washing.

              Conversions
              If recipe link is provided, treat it as a complete recipe. Extract and convert to exact Fromaggio format for 3L milk. Use cheesemaking.com to verify accuracy.

              Final Notes
              - Do not ask for clarification
              - Always produce a recipe
              - Do not include tips or suggestions
              - Adhere to format and logic exactly

              Each step must be isolated, clearly formatted, and parsable. No summary or narrative content is allowed.
`,
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