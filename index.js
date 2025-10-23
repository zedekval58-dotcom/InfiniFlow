// InfiniFlow MVP — AI-Powered Solana Perp Tool
// Ready for Vercel Deployment (Node API)

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// === CONFIG ===
const GENSPARK_API = process.env.GENSPARK_API_KEY;
const PYTH_PRICE_URL = "https://hermes.pyth.network/api/latest_price_feeds?ids[]=";
const JUPITER_API_URL = "https://quote-api.jup.ag/v6/quote";

// === TOKEN MINTS ===
const MINTS = {
  MET: "MET_MINT_PLACEHOLDER",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
};

// === AI Assistant ===
app.post("/ai", async (req, res) => {
  try {
    const prompt = req.body.prompt || "Explain Solana trading.";
    const response = await fetch("https://api.genspark.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GENSPARK_API}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "genspark-pro",
        messages: [{ role: "user", content: prompt }]
      }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Price Fetch ===
app.get("/price/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const priceRes = await fetch(PYTH_PRICE_URL + symbol);
    const priceData = await priceRes.json();
    res.json(priceData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === Jupiter Swap Preparation ===
app.post("/swap", async (req, res) => {
  const { inputMint, outputMint, amount } = req.body;
  try {
    const quoteRes = await fetch(`${JUPITER_API_URL}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=100`);
    const quote = await quoteRes.json();
    res.json(quote);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === Homepage ===
app.get("/", (req, res) => {
  res.send(`
    <h2>🚀 InfiniFlow is Live on Solana Mainnet</h2>
    <p>AI + Pyth + Jupiter = Smart Auto Trading</p>
    <ul>
      <li>POST /ai → Chat with AI</li>
      <li>GET /price/:symbol → Get live token price</li>
      <li>POST /swap → Prepare Jupiter swap</li>
    </ul>
  `);
});

app.listen(3000, () => console.log("✅ InfiniFlow API running on port 3000"));
