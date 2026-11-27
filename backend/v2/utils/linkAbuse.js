/**
 * Heuristics for spotting short links that are likely being abused (phishing,
 * scams). None of these block anything: they only decide when to warn the
 * admin over Telegram.
 */

/**
 * Free hosting / serverless platforms where anyone can spin up a subdomain in
 * seconds. Legitimate sites live there too, which is why a match only warns,
 * and only for brand-new accounts.
 */
const ABUSED_FREE_HOST_SUFFIXES = [
  "wasmer.app",
  "pages.dev",
  "workers.dev",
  "r2.dev",
  "trycloudflare.com",
  "web.app",
  "firebaseapp.com",
  "appspot.com",
  "netlify.app",
  "vercel.app",
  "github.io",
  "gitlab.io",
  "glitch.me",
  "herokuapp.com",
  "onrender.com",
  "fly.dev",
  "railway.app",
  "replit.app",
  "repl.co",
  "surge.sh",
  "ngrok-free.app",
  "ngrok.io",
  "ngrok.app",
  "webflow.io",
  "framer.app",
  "framer.website",
  "wixsite.com",
  "weebly.com",
  "godaddysites.com",
  "square.site",
  "000webhostapp.com",
  "blogspot.com",
  "translate.goog",
  "ipfs.dweb.link",
  "dweb.link",
  "azurewebsites.net",
  "web.core.windows.net",
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
];

const DAY_MS = 24 * 60 * 60 * 1000;

const intFromEnv = (name, fallback) => {
  const value = parseInt(process.env[name], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

/** Accounts younger than this many days get the free-host warning. */
const newAccountWarnDays = () => intFromEnv("ABUSE_NEW_ACCOUNT_DAYS", 7);

/**
 * Returns the matching free-host suffix when `url` is served from a
 * subdomain of one (or the bare suffix itself), otherwise null.
 */
const matchAbusedFreeHost = (url) => {
  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
  for (const suffix of ABUSED_FREE_HOST_SUFFIXES) {
    if (hostname === suffix || hostname.endsWith(`.${suffix}`)) return suffix;
  }
  return null;
};

/**
 * Age in whole days of the account owning a link. `createdAt` may be a Date
 * or ISO string; missing (e.g. guests without a known session date) → 0,
 * since an anonymous creator is the least trusted case.
 */
const accountAgeDays = (createdAt, now = Date.now()) => {
  if (!createdAt) return 0;
  const ts = new Date(createdAt).getTime();
  if (!Number.isFinite(ts)) return 0;
  return Math.max(0, Math.floor((now - ts) / DAY_MS));
};

/**
 * Decides whether a destination set by an account warrants a warning.
 * Returns { suffix, accountAgeDays } when it does, otherwise null.
 */
const freeHostWarning = (url, ownerCreatedAt, now = Date.now()) => {
  const suffix = matchAbusedFreeHost(url);
  if (!suffix) return null;
  const ageMs = ownerCreatedAt ? now - new Date(ownerCreatedAt).getTime() : 0;
  if (Number.isFinite(ageMs) && ageMs >= newAccountWarnDays() * DAY_MS) return null;
  return { suffix, accountAgeDays: accountAgeDays(ownerCreatedAt, now) };
};

module.exports = {
  ABUSED_FREE_HOST_SUFFIXES,
  matchAbusedFreeHost,
  accountAgeDays,
  freeHostWarning,
  newAccountWarnDays,
};
