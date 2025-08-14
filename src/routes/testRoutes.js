import express from 'express';
import config from '../config/env.js';
import whatsappService from '../services/whatsappService.js';

const router = express.Router();

// Simple manual test: GET /_test/send?to=57XXXXXXXXXX&text=Hola
router.get('/_test/send', async (req, res) => {
  if (!config.ENABLE_TEST_ENDPOINT) return res.sendStatus(404);
  const { to, text } = req.query;
  if (!to || !text) return res.status(400).json({ error: 'Missing to or text' });
  try {
    await whatsappService.sendMessage(String(to), String(text));
    return res.json({ status: 'ok', to, text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
