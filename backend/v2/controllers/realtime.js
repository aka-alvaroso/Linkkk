const { subscribe, unsubscribe } = require("../realtime/broadcaster");

// Long-lived SSE stream of the authenticated user's own link activity
// (new accesses/scans). Guests don't get a stream — realtime is scoped to
// registered accounts with a dashboard to update.
const stream = (req, res) => {
  const user = req.user;

  if (!user) {
    return res.sendStatus(403);
  }

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    // Disable response buffering on nginx so events reach the client immediately.
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  res.write(": connected\n\n");

  subscribe(user.id, res);

  // Keeps intermediary proxies/load balancers from closing the idle connection.
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe(user.id, res);
  });
};

module.exports = { stream };
