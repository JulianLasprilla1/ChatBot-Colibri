/**
 * Command router for incoming textual or button commands.
 * Normalizes input and maps to handler functions.
 */
export default class CommandRouter {
  constructor() {
    this.textCommands = new Map();
    this.buttonCommands = new Map();
  }

  registerText(commandList, handler) {
    (Array.isArray(commandList) ? commandList : [commandList])
      .map(c => c.toLowerCase())
      .forEach(c => this.textCommands.set(c, handler));
  }

  registerButton(id, handler) {
    this.buttonCommands.set(id, handler);
  }

  findTextHandler(text) {
    if (!text) return null;
    const key = text.toLowerCase().trim();
    return this.textCommands.get(key) || null;
  }

  findButtonHandler(id) {
    return this.buttonCommands.get(id) || null;
  }
}
