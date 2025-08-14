/**
 * @fileoverview Lógica de negocio para:
 *  - procesar mensajes entrantes,
 *  - enviar saludos personalizados,
 *  - mostrar menú interactivo (Asesor, Soporte, Ubicación),
 *  - enviar media al escribir "media".
 */
import whatsappService from './whatsappService.js';
import CommandRouter from './commandRouter.js';
import { getSession, updateSession } from '../session/memoryStore.js';
import logger from '../logger/index.js';
import chatwoot from './chatwootService.js';
import { askOpenRouter } from './openrouterService.js';

class MessageHandler {
  constructor() {
    this.router = new CommandRouter();
    // Register greetings
  this.router.registerText(['hola','hello','hi','buenas tardes'], this.handleGreeting.bind(this));
  this.router.registerText('media', this.handleMedia.bind(this));
  // Button handlers actualizados
  ['asesor','soporte','ia_productos'].forEach(id => this.router.registerButton(id, (ctx) => this.handleMenuOption(ctx.to, id, ctx.messageId)));
  }

  async handleIncomingMessage(message, senderInfo) {
    const { type, text, interactive, id: messageId, from: to } = message;
    logger.info('[MessageHandler] Incoming type=%s id=%s from=%s', type, messageId, to);
    const session = getSession(to);
    // Si la sesión fue reiniciada por timeout, mostrar menú
    if (session.state === 'idle' && session.lastActive && Date.now() - session.lastActive < 2000) {
      // Se acaba de reiniciar la sesión por inactividad
      await this.sendWelcomeMessage(to, messageId, senderInfo);
      await this.sendWelcomeMenu(to);
      updateSession(to, { state: 'greeted' });
      return;
    }
    await chatwoot.sendInbound(to, message);

    try {
      if (type === 'text') {
        const incoming = text.body || '';
        logger.debug('[MessageHandler] text="%s" state=%s', incoming, session.state);
        // Si el usuario está en modo IA productos, enviar a DeepSeek
        if (session.state === 'ia_productos') {
          const salirCmds = ['salir', 'menu', 'volver'];
          if (salirCmds.includes(incoming.trim().toLowerCase())) {
            updateSession(to, { state: 'idle' });
            await whatsappService.sendMessage(to, 'Has salido del modo IA. Aquí tienes el menú principal:', messageId);
            await this.sendWelcomeMenu(to);
            return;
          }
          try {
            await whatsappService.sendTypingOn(to);
            const respuesta = await askOpenRouter(incoming);
            await whatsappService.sendMessage(to, respuesta, messageId);
          } catch (e) {
            logger.error('[MessageHandler] Error consultando OpenRouter', e);
            await whatsappService.sendMessage(to, 'Ocurrió un error consultando la IA. Intenta de nuevo más tarde.', messageId);
          }
        } else {
          const handler = this.router.findTextHandler(incoming);
          if (handler) {
            await handler({ to, messageId, senderInfo, session, text: incoming });
          } else {
            // Fallback echo
            await whatsappService.sendMessage(to, `Echo: ${incoming}`, messageId);
          }
        }
      } else if (type === 'interactive' && interactive.button_reply) {
        const option = interactive.button_reply.id;
        const handler = this.router.findButtonHandler(option);
        if (handler) {
          await handler({ to, messageId, senderInfo, session, option });
        } else {
          await whatsappService.sendMessage(to, 'Opción no reconocida.', messageId);
        }
      } else {
        logger.warn('[MessageHandler] Unhandled message type %s', type);
      }
    } finally {
      await whatsappService.markAsRead(messageId);
    }
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = senderInfo?.profile?.name || senderInfo?.wa_id || 'allí';
    const msg  = `¡Hola ${name}! 👋\n\nBienvenido a JD Market. ¿En qué podemos ayudarte hoy?\n\nPor favor elige una opción:`;
    logger.debug('[MessageHandler] sendWelcomeMessage -> %s', msg);
    await whatsappService.sendMessage(to, msg, messageId);
  }

  async sendWelcomeMenu(to) {
    // WhatsApp solo permite hasta 3 botones, cada uno con máximo 20 caracteres en el título
    const buttons = [
      { type: 'reply', reply: { id: 'asesor', title: 'Asesor' } },
      { type: 'reply', reply: { id: 'soporte', title: 'Soporte' } },
      { type: 'reply', reply: { id: 'ia_productos', title: 'IA Productos' } }
    ];
    const bodyText = 'Selecciona una opción:';
    logger.debug('[MessageHandler] sendWelcomeMenu payload: %o', { to, bodyText, buttons });
    await whatsappService.sendInteractiveButtons(to, bodyText, buttons);
  }

  async handleMenuOption(to, option, messageId) {
    logger.debug('[MessageHandler] handleMenuOption: %s', option);
    switch (option) {
      case 'asesor':
        updateSession(to, { state: 'idle' });
        await whatsappService.sendMessage(
          to,
          '¡Perfecto! Un asesor comercial se pondrá en contacto contigo en breve. ¿Deseas dejar tu consulta o esperar?',
          messageId
        );
        break;
      case 'soporte':
        updateSession(to, { state: 'idle' });
        await whatsappService.sendMessage(
          to,
          'Conectando con soporte técnico. Por favor describe tu inconveniente y te ayudaremos lo antes posible.',
          messageId
        );
        break;
      case 'ia_productos':
        updateSession(to, { state: 'ia_productos' });
        await whatsappService.sendMessage(
          to,
          '¡Hola! Ahora puedes preguntarme sobre productos de tecnología (computadores, celulares, gadgets, hardware, software, etc).\n\nCuando quieras salir de la IA y volver al menú principal, escribe "salir", "menú" o "volver".',
          messageId
        );
        break;
      default:
        await whatsappService.sendMessage(
          to,
          'Opción no reconocida. Elige Asesor comercial, Soporte técnico o Consultar productos (IA).',
          messageId
        );
    }
  }

  async sendLocation(to) {
    const lat = 4.629107, lon = -74.083424;
    const name    = 'JD Market - Teusaquillo';
    const address = 'Cra. 31a #25A-47, Teusaquillo, Bogotá, Cundinamarca';
    logger.debug('[MessageHandler] sendLocation');
    await whatsappService.sendLocationMessage(to, lat, lon, name, address);
  }

  // Command handlers
  async handleGreeting(ctx) {
    // Siempre muestra el mensaje y el menú, sin condicionar por estado
    await this.sendWelcomeMessage(ctx.to, ctx.messageId, ctx.senderInfo);
    await this.sendWelcomeMenu(ctx.to);
    updateSession(ctx.to, { state: 'greeted' });
  }

  async handleMedia(ctx) {
    const url     = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';
    const caption = '¡Aquí tienes un PDF de ejemplo!';
    await whatsappService.sendMediaMessage(ctx.to, 'document', url, caption);
  }
}

export default new MessageHandler();
