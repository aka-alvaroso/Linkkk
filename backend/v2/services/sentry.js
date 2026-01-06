/**
 * Sentry Service
 * Initializes and configures Sentry for error tracking and monitoring
 *
 * Features:
 * - Automatic error capture
 * - Performance monitoring
 * - Release tracking
 * - User context
 * - Email notifications (configure in Sentry dashboard)
 */

const Sentry = require('@sentry/node');
const config = require('../config/environment');
const telegramService = require('./telegramService');

let initialized = false;

// Try to load profiling (optional)
let ProfilingIntegration;
try {
  ProfilingIntegration = require('@sentry/profiling-node').ProfilingIntegration;
} catch (error) {
  console.log('ℹ️  Sentry profiling not available (optional)');
}

/**
 * Initialize Sentry
 * Only initializes if SENTRY_DSN is configured
 */
const initializeSentry = () => {
  const sentryDsn = process.env.SENTRY_DSN;

  // Skip initialization if DSN not configured or in test environment
  if (!sentryDsn || config.env.isTest) {
    console.log('ℹ️  Sentry: Skipped (no DSN configured or test environment)');
    return false;
  }

  try {
    const integrations = [];

    // Add HTTP integration if available
    if (Sentry.Integrations && Sentry.Integrations.Http) {
      integrations.push(new Sentry.Integrations.Http({ tracing: true }));
    }

    // Add profiling if available
    if (ProfilingIntegration) {
      integrations.push(new ProfilingIntegration());
    }

    Sentry.init({
      dsn: sentryDsn,
      environment: config.env.nodeEnv,

      // Release tracking (useful for identifying which version has bugs)
      release: process.env.npm_package_version || 'unknown',

      // Performance monitoring (sample 10% of transactions)
      tracesSampleRate: config.env.isProduction ? 0.1 : 1.0,

      // Profiling (sample 10% of transactions) - only if available
      profilesSampleRate: ProfilingIntegration ? (config.env.isProduction ? 0.1 : 1.0) : 0,

      integrations: integrations.length > 0 ? integrations : undefined,

      // Before sending to Sentry, sanitize sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request && event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-csrf-token'];
        }

        // Remove sensitive data from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            if (breadcrumb.data && breadcrumb.data.password) {
              breadcrumb.data.password = '[REDACTED]';
            }
            if (breadcrumb.data && breadcrumb.data.token) {
              breadcrumb.data.token = '[REDACTED]';
            }
            return breadcrumb;
          });
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        // Browser errors that shouldn't happen in Node.js
        'Non-Error exception captured',
        'Non-Error promise rejection captured',

        // Common user errors that don't need tracking
        'NetworkError',
        'AbortError',
      ],
    });

    initialized = true;
    console.log(`✅ Sentry initialized (${config.env.nodeEnv})`);

    // Check if Express handlers are available
    if (!Sentry.Handlers) {
      console.log('⚠️  Sentry Express handlers not available (error tracking will still work)');
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error.message);
    return false;
  }
};

/**
 * Check if Sentry is initialized
 */
const isInitialized = () => initialized;

/**
 * Capture an exception
 * Sends to both Sentry (for dashboard) and Telegram (for real-time notifications)
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
const captureException = (error, context = {}) => {
  // Send to Sentry if initialized
  if (initialized) {
    Sentry.withScope((scope) => {
      // Add context
      if (context.user) {
        scope.setUser({
          id: context.user.id,
          email: context.user.email,
          username: context.user.username,
        });
      }

      if (context.tags) {
        Object.keys(context.tags).forEach(key => {
          scope.setTag(key, context.tags[key]);
        });
      }

      if (context.extra) {
        Object.keys(context.extra).forEach(key => {
          scope.setExtra(key, context.extra[key]);
        });
      }

      Sentry.captureException(error);
    });
  }

  // Also send to Telegram for real-time notification
  // Don't await to avoid blocking
  telegramService.notifyError(error, context).catch(err => {
    console.error('Failed to send error notification to Telegram:', err);
  });
};

/**
 * Capture a message (for non-error important events)
 * @param {string} message - Message to capture
 * @param {string} level - Severity level (fatal, error, warning, info, debug)
 * @param {Object} context - Additional context
 */
const captureMessage = (message, level = 'info', context = {}) => {
  if (!initialized) return;

  Sentry.withScope((scope) => {
    scope.setLevel(level);

    if (context.tags) {
      Object.keys(context.tags).forEach(key => {
        scope.setTag(key, context.tags[key]);
      });
    }

    if (context.extra) {
      Object.keys(context.extra).forEach(key => {
        scope.setExtra(key, context.extra[key]);
      });
    }

    Sentry.captureMessage(message);
  });
};

/**
 * Set user context for all future events
 * @param {Object} user - User object
 */
const setUser = (user) => {
  if (!initialized) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

/**
 * Clear user context
 */
const clearUser = () => {
  if (!initialized) return;
  Sentry.setUser(null);
};

/**
 * Add breadcrumb (for debugging context)
 * @param {Object} breadcrumb - Breadcrumb data
 */
const addBreadcrumb = (breadcrumb) => {
  if (!initialized) return;
  Sentry.addBreadcrumb(breadcrumb);
};

/**
 * Express error handler middleware
 * Must be registered AFTER all routes but BEFORE other error handlers
 */
const errorHandler = () => {
  if (!initialized || !Sentry.Handlers || !Sentry.Handlers.errorHandler) {
    // Return no-op middleware if Sentry not initialized or handlers not available
    return (err, req, res, next) => next(err);
  }

  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Send all errors with status >= 500 to Sentry
      return !error.statusCode || error.statusCode >= 500;
    },
  });
};

/**
 * Express request handler middleware
 * Must be registered BEFORE all routes
 */
const requestHandler = () => {
  if (!initialized || !Sentry.Handlers || !Sentry.Handlers.requestHandler) {
    // Return no-op middleware if Sentry not initialized or handlers not available
    return (req, res, next) => next();
  }

  return Sentry.Handlers.requestHandler({
    user: ['id', 'email', 'username'],
    ip: true,
  });
};

/**
 * Express tracing handler middleware
 * Must be registered BEFORE all routes
 */
const tracingHandler = () => {
  if (!initialized || !Sentry.Handlers || !Sentry.Handlers.tracingHandler) {
    // Return no-op middleware if Sentry not initialized or handlers not available
    return (req, res, next) => next();
  }

  return Sentry.Handlers.tracingHandler();
};

module.exports = {
  initializeSentry,
  isInitialized,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  errorHandler,
  requestHandler,
  tracingHandler,
  // Expose Sentry instance for advanced usage
  Sentry,
};
