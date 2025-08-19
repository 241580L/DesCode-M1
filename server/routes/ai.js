const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/ai-password', async (req, res) => {
  const { length = 10 } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a password generator.' },
        { role: 'user', content: `Generate a secure, random password with at least one uppercase letter, one lowercase letter, one number, and one symbol. Length: ${length}. Only output the password.` }
      ],
      max_tokens: 20,
      temperature: 0.9,
    });
    const password = completion.choices[0].message.content.trim();
    res.json({ password });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate password.' });
  }
});

module.exports = router;
