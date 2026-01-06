const cron = require("node-cron");
const prisma = require("../prisma/client");
const logger = require("../utils/logger");
const stripeService = require("../services/stripe");
const auditLog = require("../services/auditLog");
const telegramService = require("../services/telegramService");
const sentryService = require("../services/sentry");

/**
 * Subscription synchronization job
 *
 * This job ensures subscription states are accurate even if webhooks fail:
 *
 * 1. EXPIRED SUBSCRIPTIONS: Finds subscriptions where currentPeriodEnd has passed
 *    but status is still ACTIVE or PAST_DUE, and syncs with Stripe
 *
 * 2. FAILED EVENTS: Retries processing of FAILED StripeEvents (up to 3 attempts)
 *
 * 3. STUCK EVENTS: Identifies events that have been PENDING for too long
 *
 * Runs every 30 minutes to catch issues quickly
 */

/**
 * Sync expired subscriptions with Stripe
 * Handles cases where webhooks didn't arrive or failed
 */
const syncExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    logger.info("[SYNC] Starting expired subscriptions sync", {
      currentTime: now.toISOString(),
    });

    // Find subscriptions that should have expired but are still active
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ["ACTIVE", "PAST_DUE", "TRIALING"],
        },
        currentPeriodEnd: {
          lt: now,
        },
        stripeSubscriptionId: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    logger.info("[SYNC] Found expired subscriptions to check", {
      count: expiredSubscriptions.length,
    });

    let syncedCount = 0;
    let downgradedCount = 0;
    let errorCount = 0;

    const stripe = stripeService.initializeStripe();

    for (const subscription of expiredSubscriptions) {
      try {
        logger.info("[SYNC] Checking subscription with Stripe", {
          userId: subscription.userId,
          subscriptionId: subscription.stripeSubscriptionId,
          currentStatus: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        });

        // Fetch current state from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId
        );

        const stripeStatus = stripeSubscription.status;
        const stripePeriodEnd = new Date(
          stripeSubscription.current_period_end * 1000
        );

        logger.info("[SYNC] Retrieved subscription from Stripe", {
          userId: subscription.userId,
          stripeStatus: stripeStatus,
          stripePeriodEnd: stripePeriodEnd,
        });

        // Determine what action to take based on Stripe's status
        let shouldDowngrade = false;
        let newStatus = subscription.status;

        switch (stripeStatus) {
          case "active":
            // Subscription is still active, update period end
            newStatus = "ACTIVE";
            logger.info("[SYNC] Subscription still active, updating period", {
              userId: subscription.userId,
              newPeriodEnd: stripePeriodEnd,
            });
            break;

          case "canceled":
          case "unpaid":
            // Subscription ended, need to downgrade
            newStatus = "CANCELED";
            shouldDowngrade = true;
            logger.info("[SYNC] Subscription ended, will downgrade", {
              userId: subscription.userId,
              stripeStatus: stripeStatus,
            });
            break;

          case "past_due":
            // Payment failed but subscription still exists
            newStatus = "PAST_DUE";
            logger.info("[SYNC] Subscription past due", {
              userId: subscription.userId,
            });
            break;

          case "trialing":
            // Still in trial
            newStatus = "TRIALING";
            break;

          default:
            logger.warn("[SYNC] Unknown Stripe status", {
              userId: subscription.userId,
              stripeStatus: stripeStatus,
            });
        }

        // Update subscription in database
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: newStatus,
            currentPeriodEnd: stripePeriodEnd,
            lastSyncedAt: now,
            lastEventId: `sync_${Date.now()}`,
          },
        });

        syncedCount++;

        // Execute downgrade if needed
        if (shouldDowngrade && subscription.user.role === "PRO") {
          logger.info("[SYNC] Executing downgrade for user", {
            userId: subscription.userId,
            email: subscription.user.email,
          });

          // Import executeDowngrade from subscription controller
          const { executeDowngrade } = require("../controllers/subscription");
          await executeDowngrade(subscription.userId);

          // Log the downgrade
          await auditLog.logSubscriptionDowngraded(subscription.userId, {
            reason: "subscription_expired",
            source: "sync_job",
            stripeStatus: stripeStatus,
            previousStatus: subscription.status,
          });

          downgradedCount++;
          logger.info("[SYNC] Downgrade completed", {
            userId: subscription.userId,
          });
        }
      } catch (error) {
        errorCount++;
        logger.error("[SYNC] Error syncing subscription", {
          userId: subscription.userId,
          subscriptionId: subscription.stripeSubscriptionId,
          error: error.message,
          stack: error.stack,
        });
        // Continue with next subscription
      }
    }

    logger.info("[SYNC] Expired subscriptions sync completed", {
      checked: expiredSubscriptions.length,
      synced: syncedCount,
      downgraded: downgradedCount,
      errors: errorCount,
    });

    return {
      checked: expiredSubscriptions.length,
      synced: syncedCount,
      downgraded: downgradedCount,
      errors: errorCount,
    };
  } catch (error) {
    logger.error("[SYNC] Fatal error in subscription sync", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Retry failed Stripe events
 * Processes events with status FAILED that haven't exceeded retry limit
 */
const retryFailedEvents = async () => {
  try {
    const MAX_ATTEMPTS = 3;

    logger.info("[SYNC] Starting failed events retry");

    // Find failed events that haven't exceeded max attempts
    const failedEvents = await prisma.stripeEvent.findMany({
      where: {
        status: "FAILED",
        attempts: {
          lt: MAX_ATTEMPTS,
        },
      },
      orderBy: {
        lastAttemptAt: "asc", // Oldest attempts first
      },
      take: 10, // Process max 10 at a time to avoid overload
    });

    logger.info("[SYNC] Found failed events to retry", {
      count: failedEvents.length,
    });

    let retriedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const event of failedEvents) {
      try {
        logger.info("[SYNC] Retrying failed event", {
          eventId: event.stripeEventId,
          type: event.type,
          attempts: event.attempts,
        });

        // Update status to PROCESSING
        await prisma.stripeEvent.update({
          where: { id: event.id },
          data: {
            status: "PROCESSING",
            attempts: event.attempts + 1,
            lastAttemptAt: new Date(),
          },
        });

        // Process the event using the existing webhook handlers
        const { processWebhookEvent } = require("../controllers/subscription");
        await processWebhookEvent(event.payload);

        // Mark as processed
        await prisma.stripeEvent.update({
          where: { id: event.id },
          data: {
            status: "PROCESSED",
            processedAt: new Date(),
            error: null,
          },
        });

        successCount++;
        logger.info("[SYNC] Event retry succeeded", {
          eventId: event.stripeEventId,
          attempts: event.attempts + 1,
        });
      } catch (error) {
        failedCount++;

        // Check if we've hit max attempts
        const newAttempts = event.attempts + 1;
        const newStatus = newAttempts >= MAX_ATTEMPTS ? "DEAD_LETTER" : "FAILED";

        await prisma.stripeEvent.update({
          where: { id: event.id },
          data: {
            status: newStatus,
            error: error.message,
            lastAttemptAt: new Date(),
          },
        });

        logger.error("[SYNC] Event retry failed", {
          eventId: event.stripeEventId,
          attempts: newAttempts,
          newStatus: newStatus,
          error: error.message,
        });
      }

      retriedCount++;
    }

    logger.info("[SYNC] Failed events retry completed", {
      retried: retriedCount,
      succeeded: successCount,
      failed: failedCount,
    });

    return {
      retried: retriedCount,
      succeeded: successCount,
      failed: failedCount,
    };
  } catch (error) {
    logger.error("[SYNC] Fatal error in failed events retry", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Check for stuck events that have been pending too long
 */
const checkStuckEvents = async () => {
  try {
    const STUCK_THRESHOLD_MINUTES = 30;
    const stuckTime = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000);

    logger.info("[SYNC] Checking for stuck events");

    const stuckEvents = await prisma.stripeEvent.findMany({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"],
        },
        lastAttemptAt: {
          lt: stuckTime,
        },
      },
    });

    if (stuckEvents.length > 0) {
      logger.warn("[SYNC] Found stuck events", {
        count: stuckEvents.length,
        events: stuckEvents.map((e) => ({
          id: e.stripeEventId,
          type: e.type,
          status: e.status,
          lastAttemptAt: e.lastAttemptAt,
        })),
      });

      // Mark stuck events as FAILED so they can be retried
      for (const event of stuckEvents) {
        await prisma.stripeEvent.update({
          where: { id: event.id },
          data: {
            status: "FAILED",
            error: `Event stuck in ${event.status} state for over ${STUCK_THRESHOLD_MINUTES} minutes`,
          },
        });
      }

      logger.info("[SYNC] Marked stuck events as FAILED for retry", {
        count: stuckEvents.length,
      });
    } else {
      logger.info("[SYNC] No stuck events found");
    }

    return {
      stuckEvents: stuckEvents.length,
    };
  } catch (error) {
    logger.error("[SYNC] Error checking stuck events", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Run all sync operations
 */
const runSync = async () => {
  logger.info("[SYNC] ========== Starting subscription sync job ==========");

  try {
    // 1. Sync expired subscriptions
    const expiredResults = await syncExpiredSubscriptions();

    // 2. Retry failed events
    const retryResults = await retryFailedEvents();

    // 3. Check for stuck events
    const stuckResults = await checkStuckEvents();

    logger.info("[SYNC] ========== Subscription sync job completed ==========", {
      expiredSubscriptions: expiredResults,
      failedEvents: retryResults,
      stuckEvents: stuckResults,
    });

    // Notify Telegram if there were significant actions
    const totalActions = expiredResults.synced + retryResults.succeeded + stuckResults.stuckEvents;
    if (totalActions > 0) {
      const stats = {
        "Expired synced": expiredResults.synced,
        "Downgraded": expiredResults.downgraded,
        "Failed retried": retryResults.retried,
        "Failed succeeded": retryResults.succeeded,
        "Stuck events": stuckResults.stuckEvents,
      };
      telegramService.notifyCronJobCompleted("Subscription Sync", stats).catch(() => {});
    }

    return {
      expiredSubscriptions: expiredResults,
      failedEvents: retryResults,
      stuckEvents: stuckResults,
    };
  } catch (error) {
    logger.error("[SYNC] Subscription sync job failed", {
      error: error.message,
      stack: error.stack,
    });

    // Notify Telegram about failure
    telegramService.notifyCronJobFailed("Subscription Sync", error.message).catch(() => {});

    // Send to Sentry
    sentryService.captureException(error, {
      tags: { type: "cron_job", job: "subscription_sync" },
    });

    throw error;
  }
};

/**
 * Start the scheduled sync job
 * Runs every 30 minutes
 */
const startSyncJob = () => {
  // Schedule: "*/30 * * * *" = Every 30 minutes
  const schedule = "*/30 * * * *";

  cron.schedule(schedule, async () => {
    await runSync();
  });

  logger.info("[SYNC] Subscription sync job scheduled", {
    schedule: "Every 30 minutes",
    operations: [
      "Sync expired subscriptions with Stripe",
      "Retry failed webhook events (max 3 attempts)",
      "Check for stuck events (pending >30 min)",
    ],
  });
};

module.exports = {
  startSyncJob,
  runSync,
  syncExpiredSubscriptions,
  retryFailedEvents,
  checkStuckEvents,
};
