/**
 * Environment Configuration
 * Central place for all environment variables
 */

const dotenv = require("dotenv");
dotenv.config();

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = !isProduction;
const isTest = process.env.NODE_ENV === "test";

// Validate required environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "V2_AUTH_SECRET_KEY",
  "V2_GUEST_SECRET_KEY",
];

if (isProduction) {
  requiredEnvVars.push("FRONTEND_URL");
  requiredEnvVars.push("STRIPE_SECRET_KEY");
  requiredEnvVars.push("STRIPE_WEBHOOK_SECRET");
  requiredEnvVars.push("STRIPE_PRO_PRICE_ID");
  requiredEnvVars.push("STRIPE_PRO_YEARLY_PRICE_ID");
}

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Export configuration
const config = {
  // Environment
  env: {
    isProduction,
    isDevelopment,
    isTest,
    nodeEnv: process.env.NODE_ENV || "development",
  },

  // Server
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || (isDevelopment ? "http://localhost:3000" : "https://linkkk.dev"),
    // In development, allow multiple origins
    allowedOrigins: isDevelopment
      ? [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:3001",
        ]
      : [process.env.FRONTEND_URL],
  },

  // Security
  security: {
    jwt: {
      authSecret: process.env.V2_AUTH_SECRET_KEY,
      guestSecret: process.env.V2_GUEST_SECRET_KEY,
      authSecretPrevious: process.env.V2_AUTH_SECRET_KEY_PREVIOUS,
      guestSecretPrevious: process.env.V2_GUEST_SECRET_KEY_PREVIOUS,
      authExpiresIn: "7d",
      guestExpiresIn: "7d",
    },
    cookies: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      authMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      guestMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    },
    csrf: {
      enabled: !isTest,
    },
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    proPriceId: process.env.STRIPE_PRO_PRICE_ID,
    proYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },

  // OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      redirectUri: process.env.GITHUB_REDIRECT_URI,
    },
  },
};

// Log configuration on startup (hide sensitive data)
if (!isTest) {
  console.log("🔧 Configuration loaded:");
  console.log(`   Environment: ${config.env.nodeEnv}`);
  console.log(`   Port: ${config.server.port}`);
  console.log(`   Frontend: ${config.frontend.url}`);
  console.log(`   CORS Origins: ${config.frontend.allowedOrigins.join(", ")}`);
  console.log(
    `   JWT Auth Secret: ${
      config.security.jwt.authSecret ? "✓ Set" : "✗ Missing"
    }`
  );
  console.log(
    `   JWT Guest Secret: ${
      config.security.jwt.guestSecret ? "✓ Set" : "✗ Missing"
    }`
  );
  console.log(
    `   Stripe Secret Key: ${config.stripe.secretKey ? "✓ Set" : "✗ Missing"}`
  );
  console.log(
    `   Stripe Webhook Secret: ${
      config.stripe.webhookSecret
        ? "✓ Set"
        : "✗ Missing (configure with Stripe CLI)"
    }`
  );
  console.log(
    `   Stripe Pro Price ID (Monthly): ${
      config.stripe.proPriceId ? "✓ Set" : "✗ Missing"
    }`
  );
  console.log(
    `   Stripe Pro Price ID (Yearly): ${
      config.stripe.proYearlyPriceId ? "✓ Set" : "✗ Missing"
    }`
  );
  console.log(
    `   Google OAuth Client ID: ${
      config.oauth.google.clientId ? "✓ Set" : "✗ Missing"
    }`
  );
  console.log(
    `   Google OAuth Client Secret: ${
      config.oauth.google.clientSecret ? "✓ Set" : "✗ Missing"
    }`
  );
  console.log(
    `   GitHub OAuth Client ID: ${
      config.oauth.github.clientId ? "✓ Set" : "✗ Missing"
    }`
  );
  console.log(
    `   GitHub OAuth Client Secret: ${
      config.oauth.github.clientSecret ? "✓ Set" : "✗ Missing"
    }`
  );
}

module.exports = config;
