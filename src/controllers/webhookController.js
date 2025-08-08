/**
 * @fileoverview Controlador para procesar peticiones de webhook: mensajes y verificación.
 */
import config from '../config/env.js';
import messageHandler from '../services/messageHandler.js';

class WebhookController {
  /**
   * POST /webhook
   * - Extrae mensaje y datos de contacto.
   * - Delegación al servicio de manejo de mensajes.
   * - Responde 200 siempre para evitar reintentos.
   */
  async handleIncoming(req, res) {
    const message    = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
    const senderInfo = req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0];

    if (message) {
      await messageHandler.handleIncomingMessage(message, senderInfo);
    }
    res.sendStatus(200);
  }

  /**
   * GET /webhook
   * - Valida que `hub.mode === 'subscribe'` y el token coincida.
   * - Devuelve el `hub.challenge` o un 403 si falla.
   */
  verifyWebhook(req, res) {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified successfully!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
}

export default new WebhookController();
