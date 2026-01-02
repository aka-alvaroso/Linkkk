/**
 * Audit Log Service
 * Centralizes audit logging for critical subscription events
 */

const prisma = require('../prisma/client');

/**
 * Log subscription creation
 */
const logSubscriptionCreated = async (userId, data) => {
  await prisma.auditLog.create({
    data: {
      userId,
      eventType: 'SUBSCRIPTION_CREATED',
      eventData: {
        plan: data.plan || 'PRO',
        stripeSessionId: data.stripeSessionId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        currentPeriodEnd: data.currentPeriodEnd,
      },
      metadata: {
        source: data.source || 'stripe_webhook',
        webhookEventId: data.webhookEventId,
      },
    },
  });
};

/**
 * Log subscription upgrade (STANDARD → PRO)
 */
const logSubscriptionUpgraded = async (userId, data) => {
  await prisma.auditLog.create({
    data: {
      userId,
      eventType: 'SUBSCRIPTION_UPGRADED',
      eventData: {
        fromPlan: 'STANDARD',
        toPlan: 'PRO',
        stripeSessionId: data.stripeSessionId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        currentPeriodEnd: data.currentPeriodEnd,
      },
      metadata: {
        source: data.source || 'stripe_webhook',
        webhookEventId: data.webhookEventId,
      },
    },
  });
};

/**
 * Log subscription downgrade (PRO → STANDARD)
 */
const logSubscriptionDowngraded = async (userId, data) => {
  await prisma.auditLog.create({
    data: {
      userId,
      eventType: 'SUBSCRIPTION_DOWNGRADED',
      eventData: {
        fromPlan: 'PRO',
        toPlan: 'STANDARD',
        reason: data.reason || 'subscription_canceled',
        linksDeleted: data.linksDeleted || 0,
        rulesDeleted: data.rulesDeleted || 0,
        conditionsDeleted: data.conditionsDeleted || 0,
        accessesDeleted: data.accessesDeleted || 0,
      },
      metadata: {
        source: data.source || 'stripe_webhook',
        webhookEventId: data.webhookEventId,
        canceledAt: data.canceledAt,
      },
    },
  });
};

/**
 * Log subscription cancellation request
 */
const logSubscriptionCanceled = async (userId, data) => {
  await prisma.auditLog.create({
    data: {
      userId,
      eventType: 'SUBSCRIPTION_CANCELED',
      eventData: {
        cancelAtPeriodEnd: data.cancelAtPeriodEnd !== undefined ? data.cancelAtPeriodEnd : true,
        currentPeriodEnd: data.currentPeriodEnd,
        immediateDowngrade: data.immediateDowngrade || false,
      },
      metadata: {
        source: data.source || 'user_action',
        stripeSubscriptionId: data.stripeSubscriptionId,
      },
    },
  });
};

/**
 * Log payment failure
 */
const logPaymentFailed = async (userId, data) => {
  await prisma.auditLog.create({
    data: {
      userId,
      eventType: 'PAYMENT_FAILED',
      eventData: {
        stripeInvoiceId: data.stripeInvoiceId,
        amount: data.amount,
        currency: data.currency,
        attemptCount: data.attemptCount,
      },
      metadata: {
        source: 'stripe_webhook',
        webhookEventId: data.webhookEventId,
        failureMessage: data.failureMessage,
      },
    },
  });
};

/**
 * Log payment success (especially after a failure)
 */
const logPaymentSucceeded = async (userId, data) => {
  await prisma.auditLog.create({
    data: {
      userId,
      eventType: 'PAYMENT_SUCCEEDED',
      eventData: {
        stripeInvoiceId: data.stripeInvoiceId,
        amount: data.amount,
        currency: data.currency,
        previousStatus: data.previousStatus,
      },
      metadata: {
        source: 'stripe_webhook',
        webhookEventId: data.webhookEventId,
      },
    },
  });
};

/**
 * Clean up old audit logs (retention policy: 2 years)
 * Should be run periodically (e.g., monthly cron job)
 */
const cleanupOldLogs = async () => {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const deleted = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: twoYearsAgo,
      },
    },
  });

  console.log(`🗑️  Cleaned up ${deleted.count} audit logs older than 2 years`);
  return deleted.count;
};

module.exports = {
  logSubscriptionCreated,
  logSubscriptionUpgraded,
  logSubscriptionDowngraded,
  logSubscriptionCanceled,
  logPaymentFailed,
  logPaymentSucceeded,
  cleanupOldLogs,
};
