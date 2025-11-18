const crypto = require("crypto");

const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString("hex");
};

const getSecrets = (type = "auth") => {
  const envVar = type === "auth" ? "V2_AUTH_SECRET_KEY" : "V2_GUEST_SECRET_KEY";
  const prevEnvVar =
    type === "auth"
      ? "V2_AUTH_SECRET_KEY_PREVIOUS"
      : "V2_GUEST_SECRET_KEY_PREVIOUS";

  const current = process.env[envVar];
  const previous = process.env[prevEnvVar] || null;

  if (!current) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }

  if (current.length < 64) {
    console.warn(
      `[SECURITY WARNING] ${envVar} is shorter than recommended 64 characters`
    );
  }

  return {
    current,
    previous,
  };
};

const verifyWithRotation = (token, jwt, type = "auth", options = {}) => {
  const secrets = getSecrets(type);

  try {
    return jwt.verify(token, secrets.current, options);
  } catch (error) {
    if (secrets.previous && error.name === "JsonWebTokenError") {
      try {
        const decoded = jwt.verify(token, secrets.previous, options);

        console.warn(
          `[JWT ROTATION] Token verified with previous secret (type: ${type}). Consider re-issuing token.`
        );

        return decoded;
      } catch (prevError) {
        throw error;
      }
    }

    throw error;
  }
};

const shouldRotateSecret = (secretAge) => {
  if (!secretAge) return true;

  const ageDate = new Date(secretAge);
  const now = new Date();
  const daysSinceCreation = (now - ageDate) / (1000 * 60 * 60 * 24);

  return daysSinceCreation > 90;
};

const getRotationInstructions = () => {
  return `
JWT Secret Rotation Process:

1. Generate new secrets:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

2. Update .env file:
   # Move current secret to previous
   V2_AUTH_SECRET_KEY_PREVIOUS="<current_auth_secret>"
   V2_GUEST_SECRET_KEY_PREVIOUS="<current_guest_secret>"

   # Set new secrets
   V2_AUTH_SECRET_KEY="<new_auth_secret>"
   V2_GUEST_SECRET_KEY="<new_guest_secret>"

3. Restart application (both secrets work during transition)

4. After 7 days (token expiry), remove previous secrets:
   # Remove these lines
   # V2_AUTH_SECRET_KEY_PREVIOUS="..."
   # V2_GUEST_SECRET_KEY_PREVIOUS="..."

5. Track rotation date:
   V2_AUTH_SECRET_CREATED="2025-01-17"
   V2_GUEST_SECRET_CREATED="2025-01-17"

Recommended rotation: Every 90 days
`;
};

module.exports = {
  generateSecret,
  getSecrets,
  verifyWithRotation,
  shouldRotateSecret,
  getRotationInstructions,
};
