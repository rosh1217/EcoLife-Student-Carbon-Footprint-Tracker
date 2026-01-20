import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

/* 🔑 PUT YOUR OPENAI KEY HERE */
const openai = new OpenAI({
  apiKey: "PASTE_OPENAI_API_KEY"
});

/* DATABASE */
const db = new sqlite3.Database("database.db");
db.run(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    carbon REAL,
    water REAL,
    energy REAL,
    score REAL,
    date TEXT
  )
`);

/* SAVE USER DATA */
app.post("/save", (req, res) => {
  const { email, carbon, water, energy, score } = req.body;
  db.run(
    `INSERT INTO history VALUES (NULL,?,?,?,?,datetime('now'))`,
    [email, carbon, water, energy, score],
    () => res.send({ status: "saved" })
  );
});

/* GET USER HISTORY */
app.get("/history/:email", (req, res) => {
  db.all(
    `SELECT * FROM history WHERE email=? ORDER BY date`,
    [req.params.email],
    (err, rows) => res.json(rows)
  );
});

/* AI CHAT */
app.post("/ai", async (req, res) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an eco-friendly assistant." },
      { role: "user", content: req.body.message }
    ]
  });
  res.send({ reply: completion.choices[0].message.content });
});

app.listen(3000, () =>
  console.log("✅ Backend running on http://localhost:3000")
);
