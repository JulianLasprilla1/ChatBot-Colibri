/**
 * @fileoverview Servicio para enviar peticiones a la API de WhatsApp Cloud
 *               a través de HTTP (sendToWhatsApp). Incluye logging para depuración.
 */
import sendToWhatsApp from '../httpRequest/sendToWhatsApp.js';
import logger from '../logger/index.js';

class WhatsAppService {
  async sendTypingOn(to) {
    // WhatsApp Cloud API no tiene un endpoint oficial para 'typing', pero se puede simular con 'action' si está disponible
    // Algunos proveedores usan un mensaje especial, aquí se implementa el estándar de Cloud API
    // Si no es soportado, simplemente ignora el error
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'action',
      action: { typing: true }
    };
    try {
      await sendToWhatsApp(data);
    } catch (e) {
      // Ignorar errores de typing
    }
  }
  async sendMessage(to, body, messageId) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      text: { body },
      ...(messageId && { context: { message_id: messageId } })
    };
  logger.debug('[WhatsAppService] sendMessage payload %o', data);
    try {
      const resp = await sendToWhatsApp(data);
  logger.debug('[WhatsAppService] sendMessage response %o', resp);
    } catch (err) {
  logger.error('[WhatsAppService] sendMessage error', err);
    }
  }

  async sendInteractiveButtons(to, bodyText, buttons) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: { buttons }
      }
    };
  logger.debug('[WhatsAppService] sendInteractiveButtons payload %o', data);
    try {
      const resp = await sendToWhatsApp(data);
  logger.debug('[WhatsAppService] sendInteractiveButtons response %o', resp);
    } catch (err) {
  logger.error('[WhatsAppService] sendInteractiveButtons error', err);
    }
  }

  /**
   * Envía un mensaje multimedia y loggea payload + respuesta/error.
   * @param {string} to       Destinatario
   * @param {string} type     'image'|'audio'|'video'|'document'
   * @param {string} mediaUrl URL del archivo
   * @param {string} caption  Texto opcional
   */
  async sendMediaMessage(to, type, mediaUrl, caption) {
    let mediaObject;
    switch (type) {
      case 'image':
        mediaObject = { image: { link: mediaUrl, caption } }; break;
      case 'audio':
        mediaObject = { audio: { link: mediaUrl } }; break;
      case 'video':
        mediaObject = { video: { link: mediaUrl, caption } }; break;
      case 'document':
        mediaObject = { document: { link: mediaUrl, caption, filename: 'file.pdf' } }; break;
      default:
        console.error('[WhatsAppService] sendMediaMessage unsupported type:', type);
        throw new Error('Tipo de medio no soportado');
    }

    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type,
      ...mediaObject
    };
  logger.debug('[WhatsAppService] sendMediaMessage payload %o', data);
    try {
      const resp = await sendToWhatsApp(data);
  logger.debug('[WhatsAppService] sendMediaMessage response %o', resp);
    } catch (err) {
  logger.error('[WhatsAppService] sendMediaMessage error', err);
    }
  }

  async sendLocationMessage(to, latitude, longitude, name, address) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'location',
      location: { latitude, longitude, name, address }
    };
  logger.debug('[WhatsAppService] sendLocationMessage payload %o', data);
    try {
      const resp = await sendToWhatsApp(data);
  logger.debug('[WhatsAppService] sendLocationMessage response %o', resp);
    } catch (err) {
  logger.error('[WhatsAppService] sendLocationMessage error', err);
    }
  }

  async markAsRead(messageId) {
    const data = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };
    logger.debug('[WhatsAppService] markAsRead payload %o', data);
    try {
      const resp = await sendToWhatsApp(data);
      logger.debug('[WhatsAppService] markAsRead response %o', resp);
    } catch (err) {
      logger.error('[WhatsAppService] markAsRead error', err);
    }
  }
}


export default new WhatsAppService();
