const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const db = require("./firebase");
const { OpenAI } = require("openai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/todos", async (req, res) => {
  try {
    const todos = [];
    const snapshot = await db.collection("todos").get();
    snapshot.forEach((doc) => todos.push({ id: doc.id, ...doc.data() }));
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { text } = req.body;
    const docRef = await db.collection("todos").add({ text });
    res.status(201).json({ id: docRef.id, text });
  } catch (err) {
    res.status(500).json({ error: "Failed to add todo" });
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    await db.collection("todos").doc(id).update({ text });
    res.json({ id, text });
  } catch (err) {
    res.status(500).json({ error: "Failed to edit todo" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("todos").doc(id).delete();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.post("/summarize", async (req, res) => {
  try {
    const snapshot = await db.collection("todos").get();
    const todos = [];
    snapshot.forEach((doc) => todos.push(doc.data().text));

    if (todos.length === 0) {
      return res.status(400).json({ error: "No todos to summarize" });
    }

    const userPrompt = `Summarize the following to-do items in a professional tone:\n${todos.join(
      "\n"
    )}`;

    const chatResponse = await openai.chat.completions.create({
      messages: [{ role: "user", content: userPrompt }],
      model: "gpt-3.5-turbo",
    });

    const summary = chatResponse.choices[0].message.content;

    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: summary,
    });

    res.status(200).json({ message: "Summary sent to Slack!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summarization failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
