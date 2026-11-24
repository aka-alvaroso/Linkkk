const bcryptjs = require("bcryptjs");

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  // Using 12 rounds as recommended by OWASP (increased from 10)
  // This provides stronger protection against brute force attacks
  const saltRounds = 12;
  return await bcryptjs.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcryptjs.compare(password, hashedPassword);
};

/**
 * Cut-off to store in User.passwordChangedAt when a password changes.
 * JWT `iat` only has one-second resolution, so the cut-off is the start of
 * the next second: every token issued up to now is strictly older than it,
 * including one issued in this same second.
 * @returns {{ date: Date, seconds: number }}
 */
const passwordChangeCutoff = () => {
  const seconds = Math.floor(Date.now() / 1000) + 1;
  return { date: new Date(seconds * 1000), seconds };
};

module.exports = {
  hashPassword,
  comparePassword,
  passwordChangeCutoff,
};
