const express = require('express');
const router = express.Router();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

const bedrockClient = new BedrockRuntimeClient({
  region: 'ap-southeast-1', // Change to your Bedrock region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

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

// New route for AI review suggestion
router.post('/review-suggestion', async (req, res) => {
  const { summary } = req.body;
  if (!summary) {
    return res.status(400).json({ error: 'Summary is required.' });
  }
  try {
    const prompt = `\n\nHuman: ${summary}\nWrite a helpful, relevant review for this. Limit your reply to about 50 words. Only output the review text. Do not include any introduction or explanation.\n\nAssistant:`;
    const input = {
      prompt,
      max_tokens_to_sample: 80,
      temperature: 0.7,
    };
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-v2', // Change to your desired Bedrock model
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(input),
    });
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    // Claude returns completion in 'completion' field
    const suggestion = responseBody.completion ? responseBody.completion.trim() : '';
    res.json({ suggestion });
  } catch (err) {
    console.error('AI review suggestion error:', err);
    res.status(500).json({ error: 'Failed to generate review suggestion.' });
  }
});

// Endpoint for admin to generate AI replies to user reviews
router.post('/review-reply', async (req, res) => {
  const { review } = req.body;
  if (!review) {
    return res.status(400).json({ error: 'Review text is required.' });
  }
  try {
    const prompt = `\n\nHuman: ${review}\nWrite a concise, helpful reply to this review as an admin. Only output the reply text. Do not include any introduction or explanation.\n\nAssistant:`;
    const input = {
      prompt,
      max_tokens_to_sample: 60,
      temperature: 0.7,
    };
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-v2',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(input),
    });
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const reply = responseBody.completion ? responseBody.completion.trim() : '';
    res.json({ reply });
  } catch (err) {
    console.error('AI review reply error:', err);
    res.status(500).json({ error: 'Failed to generate AI reply.' });
  }
});

module.exports = router;
