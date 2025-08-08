/**
 * @fileoverview Lógica de negocio para:
 *  - procesar mensajes entrantes,
 *  - enviar saludos personalizados,
 *  - mostrar menú interactivo (Asesor, Soporte, Ubicación),
 *  - enviar media al escribir "media".
 */
import whatsappService from './whatsappService.js';

class MessageHandler {
  /**
   * Procesa un mensaje entrante de WhatsApp.
   *
   * @async
   * @param {Object} message        Payload del mensaje.
   * @param {Object} senderInfo     Perfil del remitente.
   */
  async handleIncomingMessage(message, senderInfo) {
    const { type, text, interactive, id: messageId, from: to } = message;
    console.log('[MessageHandler] Received message:', message);

    if (type === 'text') {
      const incoming = text.body.toLowerCase().trim();
      console.log('[MessageHandler] Text content:', incoming);

      if (['hola','hello','hi','buenas tardes'].includes(incoming)) {
        await this.sendWelcomeMessage(to, messageId, senderInfo);
        await this.sendWelcomeMenu(to);

      } else if (incoming === 'media') {
        console.log('[MessageHandler] Sending media message');
        const url     = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';
        const caption = '¡Aquí tienes un PDF de ejemplo!';
        await whatsappService.sendMediaMessage(to, 'document', url, caption);

      } else {
        await whatsappService.sendMessage(to, `Echo: ${text.body}`, messageId);
      }

    } else if (type === 'interactive' && interactive.button_reply) {
      const option = interactive.button_reply.id;
      console.log('[MessageHandler] Button clicked:', option);
      await this.handleMenuOption(to, option, messageId);
    }

    await whatsappService.markAsRead(messageId);
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = senderInfo.profile?.name || senderInfo.wa_id;
    const msg  = `Hola ${name}, bienvenido a JD Market. ¿En qué puedo ayudarte hoy?`;
    console.log('[MessageHandler] sendWelcomeMessage:', msg);
    await whatsappService.sendMessage(to, msg, messageId);
  }

  async sendWelcomeMenu(to) {
    const buttons = [
      { type:'reply', reply:{ id:'asesor',    title:'Asesor'    } },
      { type:'reply', reply:{ id:'soporte',   title:'Soporte'   } },
      { type:'reply', reply:{ id:'ubicacion', title:'Ubicación' } }
    ];
    console.log('[MessageHandler] sendWelcomeMenu');
    await whatsappService.sendInteractiveButtons(to, 'Elige una opción:', buttons);
  }

  async handleMenuOption(to, option, messageId) {
    console.log('[MessageHandler] handleMenuOption:', option);
    switch (option) {
      case 'asesor':
        await whatsappService.sendMessage(
          to,
          'Hola, un asesor se pondrá en contacto contigo pronto.',
          messageId
        );
        break;
      case 'soporte':
        await whatsappService.sendMessage(
          to,
          'Conectando con soporte técnico…',
          messageId
        );
        break;
      case 'ubicacion':
        await whatsappService.sendMessage(to, 'Nuestra sede en Bogotá:', messageId);
        await this.sendLocation(to);
        break;
      default:
        await whatsappService.sendMessage(
          to,
          'Opción no reconocida. Elige Asesor, Soporte o Ubicación.',
          messageId
        );
    }
  }

  async sendLocation(to) {
    const lat = 4.629107, lon = -74.083424;
    const name    = 'JD Market - Teusaquillo';
    const address = 'Cra. 31a #25A-47, Teusaquillo, Bogotá, Cundinamarca';
    console.log('[MessageHandler] sendLocation');
    await whatsappService.sendLocationMessage(to, lat, lon, name, address);
  }
}

export default new MessageHandler();
