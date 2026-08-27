/**
 * Default Open Graph metadata used for the bot/crawler preview page when a
 * link has no custom metadata configured (or it's disabled).
 *
 * NOTE: kept in lockstep with frontend/app/layout.tsx's `metadata.openGraph`
 * block by hand — there's no shared package between backend/frontend in this
 * monorepo, so if you change one, change the other.
 */

const DEFAULT_OG_TITLE = "Linkkk - Smart Link Management Platform";
const DEFAULT_OG_DESCRIPTION =
  "Create short links, track analytics, and manage your URLs with custom rules. Free and open-source link management platform.";
const DEFAULT_OG_IMAGE = "https://linkkk.dev/og-image.png";
const DEFAULT_OG_SITE_NAME = "Linkkk";

module.exports = {
  DEFAULT_OG_TITLE,
  DEFAULT_OG_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_SITE_NAME,
};
