/**
 * Very simple in-memory session store keyed by WhatsApp user id.
 * Provides get/update/reset helpers to manage conversational context.
 * For production replace with Redis or persistent store.
 */
const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos
const sessions = new Map();

export function getSession(userId) {
  const now = Date.now();
  let sess = sessions.get(userId);
  if (!sess) {
    sess = { createdAt: now, lastActive: now, state: 'idle', data: {} };
    sessions.set(userId, sess);
  } else {
    // Si la sesión expiró, reiniciar
    if (now - (sess.lastActive || sess.createdAt) > SESSION_TIMEOUT_MS) {
      sess = { createdAt: now, lastActive: now, state: 'idle', data: {} };
      sessions.set(userId, sess);
    } else {
      sess.lastActive = now;
    }
  }
  return sess;
}

export function updateSession(userId, patch) {
  const sess = getSession(userId);
  const updated = { ...sess, ...patch, lastActive: Date.now(), data: { ...sess.data, ...(patch.data || {}) } };
  sessions.set(userId, updated);
  return updated;
}

export function resetSession(userId) {
  sessions.delete(userId);
}

export function dumpSessions() {
  return Array.from(sessions.entries());
}
