const logger = require("../utils/logger");

// In-process SSE fan-out, keyed by userId. Backend runs as a single pm2 fork
// process (see ecosystem.config.js) so this doesn't need a shared broker like
// Redis pub/sub — if it's ever scaled to multiple instances, this would need
// to move behind one.
const clientsByUser = new Map();

// Guards against a single account opening unbounded connections (e.g. many
// stale tabs) from exhausting server memory/file descriptors.
const MAX_CONNECTIONS_PER_USER = 10;

const subscribe = (userId, res) => {
  let connections = clientsByUser.get(userId);
  if (!connections) {
    connections = new Set();
    clientsByUser.set(userId, connections);
  }

  if (connections.size >= MAX_CONNECTIONS_PER_USER) {
    const oldest = connections.values().next().value;
    oldest.end();
    connections.delete(oldest);
  }

  connections.add(res);
};

const unsubscribe = (userId, res) => {
  const connections = clientsByUser.get(userId);
  if (!connections) return;
  connections.delete(res);
  if (connections.size === 0) {
    clientsByUser.delete(userId);
  }
};

const publish = (userId, event) => {
  const connections = clientsByUser.get(userId);
  if (!connections || connections.size === 0) return;

  const message = `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;

  for (const res of connections) {
    try {
      res.write(message);
    } catch (error) {
      logger.warn("[REALTIME] Failed to write to SSE connection", {
        userId,
        error: error.message,
      });
      connections.delete(res);
    }
  }
};

module.exports = { subscribe, unsubscribe, publish };
