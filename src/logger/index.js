/**
 * Simple logger wrapper. Can be replaced by pino/winston later.
 * Provides leveled logging and automatic timestamp.
 */
function log(level, ...args) {
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`[${ts}] [${level.toUpperCase()}]`, ...args);
}

export default {
  info: (...a) => log('info', ...a),
  warn: (...a) => log('warn', ...a),
  error: (...a) => log('error', ...a),
  debug: (...a) => log('debug', ...a),
};
