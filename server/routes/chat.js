// server/routes/chat.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Chat, ChatMessage, CodeOfPractices } = require('../models');
const { upload } = require('../middlewares/upload');
const { validateToken } = require('../middlewares/auth');
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { wiz, log } = require('../utils');

// Helper: cosine similarity
function cosineSim(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

router.post("/:id/message", validateToken, upload.array('files'), async (req, res) => {
  log("Received AI prompt")
  const chat = await Chat.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!chat) {
    log("Chat not found.");
    return res.status(404).json({ message: "Not found" })
  };

  const files = req.files || [];

  // Enforce first message must have at least one file
  const existingMessages = await ChatMessage.count({ where: { chatId: chat.id } });
  if (existingMessages === 0 && files.length === 0) {
    log("First message must include at least one blueprint file.");
    return res.status(400).json({ message: "First message must include at least one blueprint file." });
  }

  // Save user message with JSON array of filenames
  const userMessage = await ChatMessage.create({
    chatId: chat.id,
    sender: 'user',
    file: files.length > 0 ? files.map(f => f.filename) : null,
    contents: req.body.text || "",
    datePosted: new Date(),
  });
  log("Message Created")
  // Load all COPs
  const cops = await CodeOfPractices.findAll({ where: { deleted: false } });
  let copTexts = [];
  const chunkSize = 1000; // characters per chunk
  const topChunksPerCop = 3; // number of top relevant chunks per CoP
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: req.body.text || ""
  });
  const queryVec = queryEmbedding.data[0].embedding;

  for (const cop of cops) {
    const copPath = path.join(__dirname, '..', 'public', 'uploads', cop.contents);
    let text = '';
    try {
      text = fs.readFileSync(copPath, 'utf8');
    } catch (e) {
      wiz(e, "Error whilst reading CoP document:");
      continue;
    }
    // Split into chunks
    let chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    // Score each chunk
    let scoredChunks = [];
    for (const chunk of chunks) {
      try {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk
        });
        const sim = cosineSim(queryVec, embedding.data[0].embedding);
        scoredChunks.push({ chunk, score: sim });
      } catch (e) {
        wiz(e, "Error whilst embedding chunk:");
      }
    }
    // Sort and select top N chunks
    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, topChunksPerCop);
    for (const { chunk } of topChunks) {
      copTexts.push(`COP Document "${cop.name}" (Relevant Section):\n${chunk}\n`);
    }
  }

  // Limit prior messages to last 10
  const priorMessages = await ChatMessage.findAll({
    where: { chatId: chat.id },
    order: [['datePosted', 'ASC']],
  });
  const limitedMessages = priorMessages.slice(-10);
  log("preparing messages...");
const messagesForGPT = [
  {
    role: "system",
    content: `You are DesCode AI Assistant. Use the following Codes of Practice as primary sources for blueprint validation:

${copTexts.join('\n---\n')}

${chat.allowExternal ? "You may also use credible external internet sources as complements." : "Do not use external sources beyond these documents."}

IMPORTANT: Format your responses in Markdown (use headings, lists, bold, italic, and code blocks when relevant) so the frontend can render them nicely.`
  },
  ...limitedMessages.map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.contents || ""
  }))
];

  let aiMessage = null;
  try {
    log("generating response...")
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesForGPT,
    });
    const aiText = response.choices[0].message.content;
    log(`response received.\nTEXT: ${aiText}\nsaving response`)

    aiMessage = await ChatMessage.create({
      chatId: chat.id,
      sender: 'ai',
      contents: aiText, // <-- contains Markdown markup
      datePosted: new Date(),
    });

    chat.dateLastMessage = new Date();
    await chat.save();
  } catch (err) {
    wiz(err, "AI ERROR:");
    return res.status(500).json({ message: "AI processing failed" });
  }

  res.json({ user: userMessage, ai: aiMessage });
  log(`Done!`)
});

// Create chat
router.post("/", validateToken, async (req, res) => {
  const { allowExternal, title } = req.body;
  const now = new Date();
  const chat = await Chat.create({
    userId: req.user.id,
    allowExternal,
    title: title || "New Chat",
    dateCreated: now,
    dateLastMessage: now,
  });
  res.json(chat);
});


// List chats
router.get("/", validateToken, async (req, res) => {
  const chats = await Chat.findAll({ where: { userId: req.user.id }, include: 'Messages' });
  res.json(chats);
});

// Get chat by id
router.get("/:id", validateToken, async (req, res) => {
  const chat = await Chat.findOne({ where: { id: req.params.id, userId: req.user.id }, include: 'Messages' });
  if (!chat) return res.status(404).json({ message: "Not found" });
  res.json(chat);
});

// Delete chat and cascade messages
router.delete("/:id", validateToken, async (req, res) => {
  await ChatMessage.destroy({ where: { chatId: req.params.id } });
  await Chat.destroy({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ message: "Deleted" });
});

router.put("/:id", validateToken, async (req, res) => {
  const chat = await Chat.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!chat) return res.status(404).json({ message: "Not found" });

  if (req.body.title !== undefined) chat.title = req.body.title;
  if (req.body.allowExternal !== undefined) chat.allowExternal = req.body.allowExternal;

  await chat.save();
  res.json(chat);
});


module.exports = router; // At the end of each javascript file in routes, this line MUST be included.