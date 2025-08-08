/**
 * @fileoverview Define las rutas de webhook y las vincula con los métodos del controlador.
 */
import express from 'express';
import webhookController from '../controllers/webhookController.js';

const router = express.Router();

/**
 * POST /webhook
 * Recibe notificaciones entrantes de WhatsApp Cloud API.
 */
router.post('/webhook', webhookController.handleIncoming);

/**
 * GET /webhook
 * Verifica la suscripción inicial del webhook.
 */
router.get('/webhook', webhookController.verifyWebhook);

export default router;
