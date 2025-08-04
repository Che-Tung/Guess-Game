import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());           // ← 解鎖所有瀏覽器請求
app.use(express.json());

// 讀取環境變數
const OPENAI_KEY = process.env.OPENAI_KEY;

/** 轉呼 OpenAI；前端 POST {prompt:"..."} 到 /gpt */
app.post("/gpt", async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "No prompt" });

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "你是一個題庫產生器，只回覆題目本身。" },
          { role: "user", content: prompt },
        ],
        max_tokens: 60,
        temperature: 0.8,
      }),
    });
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    res.json({ text: data.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI error" });
  }
});

// 👉 靜態檔放 /public 目錄
app.use(express.static("public"));

// Render 會把 PORT 環境變數設成 10000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server on http://localhost:" + PORT));
