/**
 * Environment Configuration
 * Central place for all environment variables
 */

const dotenv = require('dotenv');
dotenv.config();

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;
const isTest = process.env.NODE_ENV === 'test';

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'V2_AUTH_SECRET_KEY',
  'V2_GUEST_SECRET_KEY',
];

if (isProduction) {
  requiredEnvVars.push('FRONTEND_URL');
}

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Export configuration
const config = {
  // Environment
  env: {
    isProduction,
    isDevelopment,
    isTest,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Server
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    // In development, allow multiple origins
    allowedOrigins: isDevelopment
      ? [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
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
      expiresIn: '7d',
    },
    cookies: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    },
    csrf: {
      enabled: !isTest,
    },
  },

  // Rate Limiting
  rateLimit: {
    // General API rate limit
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isDevelopment ? 1000 : 500,
    },
    // Auth endpoints (stricter)
    auth: {
      register: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: isDevelopment ? 100 : 5,
      },
      login: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: isDevelopment ? 100 : 10,
      },
      logout: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: isDevelopment ? 100 : 10,
      },
      validate: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: isDevelopment ? 500 : 100,
      },
    },
    // Link operations
    link: {
      create: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: isDevelopment ? 500 : 50,
      },
      update: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: isDevelopment ? 500 : 50,
      },
      delete: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: isDevelopment ? 500 : 100,
      },
      list: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: isDevelopment ? 500 : 200,
      },
      // Password verification for protected links
      passwordAttempts: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: isDevelopment ? 100 : 3,
        skipSuccessfulRequests: true,
      },
      // Rule operations per link
      ruleOperations: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: isDevelopment ? 100 : 20,
        skipSuccessfulRequests: true,
      },
    },
    // Analytics
    analytics: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: isDevelopment ? 500 : 200,
    },
  },

  // Logging
  logging: {
    level: isDevelopment ? 'debug' : 'info',
    includeStackTrace: isDevelopment,
  },
};

// Log configuration on startup (hide sensitive data)
if (!isTest) {
  console.log('🔧 Configuration loaded:');
  console.log(`   Environment: ${config.env.nodeEnv}`);
  console.log(`   Port: ${config.server.port}`);
  console.log(`   Frontend: ${config.frontend.url}`);
  console.log(`   CORS Origins: ${config.frontend.allowedOrigins.join(', ')}`);
  console.log(`   Database: ${config.database.url ? '✓ Connected' : '✗ Not configured'}`);
  console.log(`   JWT Auth Secret: ${config.security.jwt.authSecret ? '✓ Set' : '✗ Missing'}`);
  console.log(`   JWT Guest Secret: ${config.security.jwt.guestSecret ? '✓ Set' : '✗ Missing'}`);
}

module.exports = config;
