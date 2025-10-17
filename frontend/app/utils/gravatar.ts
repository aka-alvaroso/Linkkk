import md5 from 'md5';

/**
 * Generate Gravatar URL from email
 * @param email User's email address
 * @param size Avatar size in pixels (default: 200)
 * @param defaultImage Default image type if no Gravatar exists
 * @returns Gravatar URL
 */
export function getGravatarUrl(
  email: string,
  size: number = 200,
  defaultImage: 'mp' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' = 'retro'
): string {
  const trimmedEmail = email.trim().toLowerCase();
  const hash = md5(trimmedEmail);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
}

/**
 * Get user avatar URL with Gravatar fallback
 * @param avatarUrl User's custom avatar URL (if any)
 * @param email User's email for Gravatar fallback
 * @param size Avatar size in pixels
 * @returns Avatar URL
 */
export function getUserAvatarUrl(
  avatarUrl: string | null | undefined,
  email: string,
  size: number = 200
): string {
  if (avatarUrl) {
    return avatarUrl;
  }
  return getGravatarUrl(email, size);
}
