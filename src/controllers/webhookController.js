/**
 * @fileoverview Controlador para procesar peticiones de webhook: mensajes y verificación.
 */
import config from '../config/env.js';
import messageHandler from '../services/messageHandler.js';
import logger from '../logger/index.js';

class WebhookController {
  /**
   * POST /webhook
   * - Extrae mensaje y datos de contacto.
   * - Delegación al servicio de manejo de mensajes.
   * - Responde 200 siempre para evitar reintentos.
   */
  async handleIncoming(req, res) {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];
    const senderInfo = value?.contacts?.[0];

    try {
      if (message) {
        // Mostrar en consola el mensaje recibido para monitoreo en modo manual
        console.log(`[WhatsApp] Mensaje recibido de ${message.from}: ${message.text?.body || '[no-text]'}`);
        // Mensaje de usuario: procesar y loguear como INFO
        logger.info('[WebhookController] Mensaje recibido tipo=%s de=%s', message.type, message.from);
        await messageHandler.handleIncomingMessage(message, senderInfo);
      } else if (value?.statuses) {
        // Evento de status (entregado, leído, etc): loguear como DEBUG
        logger.debug('[WebhookController] Evento status recibido: %o', value.statuses);
      } else if (value) {
        // Otro tipo de evento (ej: cambios de perfil, etc): loguear como DEBUG
        logger.debug('[WebhookController] Evento no-mensaje recibido: %o', value);
      } // Si value es undefined, probablemente POST vacío o formato incorrecto
      res.sendStatus(200);
    } catch (err) {
      logger.error('[WebhookController] Error processing webhook', err);
      res.sendStatus(200);
    }
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
  logger.info('Webhook verified successfully!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
}

export default new WebhookController();
