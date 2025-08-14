/**
 * Stub for future Chatwoot integration.
 * Exposes methods that later will push messages/events to Chatwoot inbox.
 */
import logger from '../logger/index.js';

class ChatwootService {
  constructor() {
    this.enabled = false; // toggle when credentials configured
  }

  configure({ baseUrl, token, inboxId }) {
    this.enabled = Boolean(baseUrl && token && inboxId);
    this.config = { baseUrl, token, inboxId };
    logger.info('[Chatwoot] configured enabled=%s', this.enabled);
  }

  async sendInbound(from, message) {
    if (!this.enabled) return;
    // Future: POST to Chatwoot endpoint
    logger.debug('[Chatwoot] sendInbound stub', { from, message });
  }

  async sendEvent(event) {
    if (!this.enabled) return;
    logger.debug('[Chatwoot] sendEvent stub', event);
  }
}

export default new ChatwootService();
