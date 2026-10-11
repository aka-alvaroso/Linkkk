/**
 * Tracks recent hits per (link owner, IP) so rules can detect an IP sweeping
 * several of the same owner's links in a short time. Sweeping is not something a
 * person does, but link-list scrapers and scanners do it constantly.
 *
 * In memory only: a restart forgets the window, which is harmless for a
 * window measured in seconds.
 */

const MAX_WINDOW_SECONDS = 300;
const MAX_KEYS = 10000;
const MAX_HITS_PER_KEY = 200;

const hitsByKey = new Map();

const ownerKeyOf = (link) =>
  link.userId != null ? `u${link.userId}` : `g${link.guestSessionId ?? "none"}`;

const prune = (hits, now) => {
  const cutoff = now - MAX_WINDOW_SECONDS * 1000;
  let i = 0;
  while (i < hits.length && hits[i].ts < cutoff) i++;
  if (i > 0) hits.splice(0, i);
};

/**
 * Records a hit and returns the recent hits (including this one) for the same
 * owner and IP, oldest first.
 */
const recordHit = (link, ip, now = Date.now()) => {
  if (!ip) return [];
  const key = `${ownerKeyOf(link)}:${ip}`;

  let hits = hitsByKey.get(key);
  if (!hits) {
    // Evict expired keys before refusing new ones, so a flood can't pin memory
    if (hitsByKey.size >= MAX_KEYS) sweep(now);
    if (hitsByKey.size >= MAX_KEYS) return [{ linkId: link.id, ts: now }];
    hits = [];
    hitsByKey.set(key, hits);
  }

  prune(hits, now);
  hits.push({ linkId: link.id, ts: now });
  if (hits.length > MAX_HITS_PER_KEY) hits.splice(0, hits.length - MAX_HITS_PER_KEY);
  return hits.slice();
};

const sweep = (now = Date.now()) => {
  for (const [key, hits] of hitsByKey) {
    prune(hits, now);
    if (hits.length === 0) hitsByKey.delete(key);
  }
};

/** Number of distinct links among `hits` within the last `seconds` seconds. */
const distinctLinksWithin = (hits, seconds, now = Date.now()) => {
  if (!Array.isArray(hits)) return 0;
  const cutoff = now - seconds * 1000;
  const ids = new Set();
  for (const h of hits) if (h.ts >= cutoff) ids.add(h.linkId);
  return ids.size;
};

const _reset = () => hitsByKey.clear();

module.exports = {
  recordHit,
  distinctLinksWithin,
  MAX_WINDOW_SECONDS,
  _reset,
};
