-- Data migration: move the manual lock of user 128 onto the ban fields.
--
-- On 2026-11-26 user 128 used Linkkk short links in a phishing campaign. It
-- was locked by hand by prefixing "oauthId" with 'blocked-phishing:' and
-- setting "passwordChangedAt" = now(). Now that a real ban exists, set
-- "blockedAt" and restore the original "oauthId".
--
-- Every statement is guarded on the manual-lock marker, so this is a no-op on
-- databases where user 128 is someone else or was never locked (staging, dev,
-- test). "blockedAt" is taken from "passwordChangedAt", which was set at the
-- moment of the manual lock.
--
-- The oauthId is only restored when no other account holds the same
-- (oauthProvider, oauthId) pair, so the unique constraint cannot make this
-- migration fail; in that case the prefix stays and the ban is still applied.
-- Deploy this together with the code that enforces "blockedAt": once the
-- prefix is gone, only that code keeps the account out of OAuth sign-in.

UPDATE "User"
SET
  "blockedAt"     = COALESCE("blockedAt", "passwordChangedAt", CURRENT_TIMESTAMP),
  "blockedReason" = COALESCE("blockedReason", 'phishing campaign using Linkkk short links (2026-11-26)')
WHERE "id" = 128
  AND "oauthId" LIKE 'blocked-phishing:%';

UPDATE "User" u
SET "oauthId" = substring(u."oauthId" FROM char_length('blocked-phishing:') + 1)
WHERE u."id" = 128
  AND u."oauthId" LIKE 'blocked-phishing:%'
  AND u."blockedAt" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "User" o
    WHERE o."id" <> u."id"
      AND o."oauthProvider" = u."oauthProvider"
      AND o."oauthId" = substring(u."oauthId" FROM char_length('blocked-phishing:') + 1)
  );
