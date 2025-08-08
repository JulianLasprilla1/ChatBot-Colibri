/**
 * @fileoverview Servicio para enviar peticiones a la API de WhatsApp Cloud
 *               a través de HTTP (sendToWhatsApp). Incluye logging para depuración.
 */
import sendToWhatsApp from '../httpRequest/sendToWhatsApp.js';

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      text: { body },
      ...(messageId && { context: { message_id: messageId } })
    };
    console.log('[WhatsAppService] sendMessage payload:', data);
    try {
      const resp = await sendToWhatsApp(data);
      console.log('[WhatsAppService] sendMessage response:', resp);
    } catch (err) {
      console.error('[WhatsAppService] sendMessage error:', err);
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
    console.log('[WhatsAppService] sendInteractiveButtons payload:', data);
    try {
      const resp = await sendToWhatsApp(data);
      console.log('[WhatsAppService] sendInteractiveButtons response:', resp);
    } catch (err) {
      console.error('[WhatsAppService] sendInteractiveButtons error:', err);
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
    console.log('[WhatsAppService] sendMediaMessage payload:', data);
    try {
      const resp = await sendToWhatsApp(data);
      console.log('[WhatsAppService] sendMediaMessage response:', resp);
    } catch (err) {
      console.error('[WhatsAppService] sendMediaMessage error:', err);
    }
  }

  async sendLocationMessage(to, latitude, longitude, name, address) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'location',
      location: { latitude, longitude, name, address }
    };
    console.log('[WhatsAppService] sendLocationMessage payload:', data);
    try {
      const resp = await sendToWhatsApp(data);
      console.log('[WhatsAppService] sendLocationMessage response:', resp);
    } catch (err) {
      console.error('[WhatsAppService] sendLocationMessage error:', err);
    }
  }

  async markAsRead(messageId) {
    const data = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };
    console.log('[WhatsAppService] markAsRead payload:', data);
    try {
      const resp = await sendToWhatsApp(data);
      console.log('[WhatsAppService] markAsRead response:', resp);
    } catch (err) {
      console.error('[WhatsAppService] markAsRead error:', err);
    }
  }
}

export default new WhatsAppService();
