import express from 'express';
import whatsappService from '../services/whatsappService.js';

const router = express.Router();

// Endpoint para enviar mensajes manualmente desde el backend
// POST /admin/send { to: '57XXXXXXXXXX', text: 'Mensaje' }
router.post('/admin/send', async (req, res) => {
  const { to, text } = req.body;
  if (!to || !text) return res.status(400).json({ error: 'Faltan parámetros: to y text' });
  try {
    await whatsappService.sendMessage(String(to), String(text));
    return res.json({ status: 'ok', to, text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
