/**
 * Detects traffic bursts on links owned by brand-new accounts (or guests).
 *
 * A phishing link shared in a campaign gets a lot of hits from link scanners
 * (mail gateways, Safe Links, cloud sandboxes) and victims within its first
 * hours, while a normal new user's links barely get clicked. When a young
 * account's link passes the threshold in a rolling hour, the admin gets one
 * Telegram alert for that link, then nothing more until the cooldown ends.
 *
 * Every hit counts, bots included: scanners are exactly the signal here.
 *
 * In memory only (the backend runs as a single process): a restart loses the
 * window and the cooldowns, which at worst means one extra alert.
 */

const WINDOW_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LINKS = 5000;
const MAX_HITS_PER_LINK = 2000;

const intFromEnv = (name, fallback) => {
  const value = parseInt(process.env[name], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const settings = () => ({
  threshold: intFromEnv("ABUSE_BURST_THRESHOLD", 30),
  maxAccountAgeDays: intFromEnv("ABUSE_BURST_ACCOUNT_DAYS", 7),
  cooldownMs: intFromEnv("ABUSE_BURST_COOLDOWN_HOURS", 6) * 60 * 60 * 1000,
});

// linkId → { hits: [{ ts, country, isBot }], alertedAt: number|null }
const stateByLink = new Map();

const prune = (hits, now) => {
  const cutoff = now - WINDOW_MS;
  let i = 0;
  while (i < hits.length && hits[i].ts < cutoff) i++;
  if (i > 0) hits.splice(0, i);
};

const sweep = (now, cooldownMs) => {
  for (const [key, state] of stateByLink) {
    prune(state.hits, now);
    const cooling = state.alertedAt && now - state.alertedAt < cooldownMs;
    if (state.hits.length === 0 && !cooling) stateByLink.delete(key);
  }
};

const topCountries = (hits, limit = 5) => {
  const counts = new Map();
  for (const h of hits) {
    const c = h.country || "??";
    counts.set(c, (counts.get(c) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([country, count]) => ({ country, count }));
};

/**
 * Whether the link's owner is young enough to be watched. `ownerCreatedAt` is
 * the user's or guest session's creation date; unknown → watched.
 */
const isYoungOwner = (ownerCreatedAt, now, maxAccountAgeDays) => {
  if (!ownerCreatedAt) return true;
  const ts = new Date(ownerCreatedAt).getTime();
  if (!Number.isFinite(ts)) return true;
  return now - ts < maxAccountAgeDays * DAY_MS;
};

/**
 * Records one hit. Returns the alert payload when this hit crosses the
 * threshold and the link isn't in cooldown, otherwise null.
 *
 * @returns {null | { count: number, botCount: number, topCountries: {country: string, count: number}[] }}
 */
const recordLinkHit = (link, { ownerCreatedAt, country, isBot }, now = Date.now()) => {
  const { threshold, maxAccountAgeDays, cooldownMs } = settings();
  if (!link?.id || !isYoungOwner(ownerCreatedAt, now, maxAccountAgeDays)) return null;

  let state = stateByLink.get(link.id);
  if (!state) {
    if (stateByLink.size >= MAX_LINKS) sweep(now, cooldownMs);
    if (stateByLink.size >= MAX_LINKS) return null;
    state = { hits: [], alertedAt: null };
    stateByLink.set(link.id, state);
  }

  prune(state.hits, now);
  state.hits.push({ ts: now, country: country || null, isBot: !!isBot });
  if (state.hits.length > MAX_HITS_PER_LINK) {
    state.hits.splice(0, state.hits.length - MAX_HITS_PER_LINK);
  }

  if (state.hits.length < threshold) return null;
  if (state.alertedAt && now - state.alertedAt < cooldownMs) return null;

  state.alertedAt = now;
  return {
    count: state.hits.length,
    botCount: state.hits.filter((h) => h.isBot).length,
    topCountries: topCountries(state.hits),
  };
};

const _reset = () => stateByLink.clear();

module.exports = {
  recordLinkHit,
  topCountries,
  _reset,
};
