const prisma = require("../prisma/client");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
const planLimits = require("../utils/limits");
const config = require("../config/environment");
const stripeService = require("../services/stripe");
const auditLog = require("../services/auditLog");
const emailService = require("../services/emailService");
const telegramService = require("../services/telegramService");

const getStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        links: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return errorResponse(res, ERRORS.USER_NOT_FOUND);
    }

    // Get plan limits
    const role = user.role.toLowerCase(); // 'STANDARD' -> 'standard', 'PRO' -> 'pro'
    const limits = planLimits[role === "standard" ? "user" : role];

    // Count current usage
    const linkCount = user.links.length;

    const response = {
      plan: user.role,
      subscription: user.subscription
        ? {
            status: user.subscription.status,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
          }
        : null,
      limits: {
        links: {
          used: linkCount,
          max: limits.links,
          unlimited: limits.links === null,
        },
        rulesPerLink: limits.rulesPerLink,
        conditionsPerRule: limits.conditionsPerRule,
        linkAnalytics: limits.linkAnalytics,
      },
    };

    return successResponse(res, response);
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// TODO: Remove
const simulateUpgrade = async (req, res) => {
  if (config.env.isProduction) {
    return errorResponse(res, {
      code: "FORBIDDEN",
      message: "This endpoint is only available in development",
      statusCode: 403,
    });
  }

  try {
    const userId = req.user.id;

    // Update user role to PRO
    await prisma.user.update({
      where: { id: userId },
      data: { role: "PRO" },
    });

    // Create or update subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30); // 30 days from now

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          status: "ACTIVE",
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          status: "ACTIVE",
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      });
    }

    return successResponse(res, {
      message: "Successfully upgraded to PRO (simulated)",
      role: "PRO",
      periodEnd: periodEnd.toISOString(),
    });
  } catch (error) {
    console.error("Error simulating upgrade:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// TODO: Remove
const simulateCancel = async (req, res) => {
  if (config.env.isProduction) {
    return errorResponse(res, {
      code: "FORBIDDEN",
      message: "This endpoint is only available in development",
      statusCode: 403,
    });
  }

  try {
    const userId = req.user.id;

    // Execute downgrade logic
    await executeDowngrade(userId);

    return successResponse(res, {
      message: "Successfully downgraded to STANDARD (simulated)",
      role: "STANDARD",
    });
  } catch (error) {
    console.error("Error simulating cancel:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// TODO: Remove
const testTelegram = async (req, res) => {
  if (config.env.isProduction) {
    return errorResponse(res, {
      code: "FORBIDDEN",
      message: "This endpoint is only available in development",
      statusCode: 403,
    });
  }

  try {
    const result = await telegramService.sendTestNotification();

    if (result.success) {
      return successResponse(res, {
        message: "Telegram test notification sent successfully",
        messageId: result.messageId,
      });
    } else {
      return errorResponse(res, {
        code: "TELEGRAM_ERROR",
        message: result.error || "Failed to send Telegram notification",
        statusCode: 500,
      });
    }
  } catch (error) {
    console.error("Error testing Telegram:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return errorResponse(res, ERRORS.USER_NOT_FOUND);
    }

    if (user.role !== "PRO") {
      return errorResponse(res, {
        code: "NOT_PRO_USER",
        message: "User is not on PRO plan",
        statusCode: 400,
      });
    }

    if (!user.subscription) {
      return errorResponse(res, {
        code: "NO_SUBSCRIPTION",
        message: "No active subscription found",
        statusCode: 400,
      });
    }

    // In development: immediate downgrade
    if (config.env.isDevelopment) {
      await executeDowngrade(userId);

      // Log cancellation with immediate downgrade
      await auditLog.logSubscriptionCanceled(userId, {
        cancelAtPeriodEnd: false,
        immediateDowngrade: true,
        source: "user_action",
        stripeSubscriptionId: user.subscription.stripeSubscriptionId,
      });

      return successResponse(res, {
        message:
          "Subscription canceled and downgraded immediately (development mode)",
        role: "STANDARD",
      });
    }

    // In production: mark to cancel at period end
    // The actual downgrade will be handled by Stripe webhook
    await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      },
    });

    // Log cancellation request
    await auditLog.logSubscriptionCanceled(userId, {
      cancelAtPeriodEnd: true,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      source: "user_action",
      stripeSubscriptionId: user.subscription.stripeSubscriptionId,
    });

    return successResponse(res, {
      message: "Subscription will be canceled at the end of the billing period",
      cancelAtPeriodEnd: true,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const executeDowngrade = async (userId) => {
  console.log(`⬇️  Starting downgrade for user ${userId}`);

  const STANDARD_LIMITS = planLimits.user;
  const ACCESS_RETENTION_DAYS =
    STANDARD_LIMITS.linkAnalytics.linkAccessesDuration;

  // Track statistics for audit log
  let stats = {
    linksDeleted: 0,
    rulesDeleted: 0,
    conditionsDeleted: 0,
    accessesDeleted: 0,
  };

  // Start transaction for atomic operations
  await prisma.$transaction(async (tx) => {
    // 1. Get user's links (ordered by oldest first for deletion)
    const userLinks = await tx.link.findMany({
      where: { userId },
      include: {
        rules: {
          include: {
            conditions: true,
          },
        },
      },
      orderBy: { createdAt: "asc" }, // Oldest first
    });

    // 2. Delete old access records (>30 days)
    const accessExpirationDate = new Date(
      Date.now() - ACCESS_RETENTION_DAYS * 24 * 60 * 60 * 1000
    );

    const userLinkIds = userLinks.map((link) => link.id);

    const deletedAccesses = await tx.access.deleteMany({
      where: {
        linkId: { in: userLinkIds },
        createdAt: { lt: accessExpirationDate },
      },
    });
    stats.accessesDeleted = deletedAccesses.count;

    // 3. Handle links over limit (50) - DELETE oldest links
    if (userLinks.length > STANDARD_LIMITS.links) {
      const linksToDelete = userLinks.slice(
        0,
        userLinks.length - STANDARD_LIMITS.links
      );
      const linkIdsToDelete = linksToDelete.map((link) => link.id);

      // Delete oldest links over limit (cascade will delete rules, conditions, and accesses)
      await tx.link.deleteMany({
        where: { id: { in: linkIdsToDelete } },
      });
      stats.linksDeleted = linksToDelete.length;
    }

    // 4. Get remaining links after deletion
    const remainingLinks = userLinks.slice(
      Math.max(0, userLinks.length - STANDARD_LIMITS.links)
    );

    // 5. Handle rules over limit - DELETE extra rules
    for (const link of remainingLinks) {
      if (link.rules.length > STANDARD_LIMITS.rulesPerLink) {
        // Delete extra rules (keep only first 3 by priority)
        const rulesToDelete = link.rules
          .sort((a, b) => a.priority - b.priority)
          .slice(STANDARD_LIMITS.rulesPerLink);

        const ruleIdsToDelete = rulesToDelete.map((rule) => rule.id);

        // Delete extra rules (cascade will delete conditions)
        await tx.linkRule.deleteMany({
          where: { id: { in: ruleIdsToDelete } },
        });
        stats.rulesDeleted += rulesToDelete.length;
      }

      // 6. Handle conditions over limit - DELETE extra conditions
      const keptRules = link.rules
        .sort((a, b) => a.priority - b.priority)
        .slice(0, STANDARD_LIMITS.rulesPerLink);

      for (const rule of keptRules) {
        if (rule.conditions.length > STANDARD_LIMITS.conditionsPerRule) {
          // Delete extra conditions (keep only first 2)
          const conditionsToDelete = rule.conditions.slice(
            STANDARD_LIMITS.conditionsPerRule
          );
          const conditionIdsToDelete = conditionsToDelete.map((c) => c.id);

          await tx.ruleCondition.deleteMany({
            where: { id: { in: conditionIdsToDelete } },
          });
          stats.conditionsDeleted += conditionsToDelete.length;
        }
      }
    }

    // 7. Update user role to STANDARD
    await tx.user.update({
      where: { id: userId },
      data: { role: "STANDARD" },
    });

    // 8. Update subscription status
    await tx.subscription.update({
      where: { userId },
      data: {
        status: "CANCELED",
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      },
    });
  });

  // Log the downgrade with statistics
  await auditLog.logSubscriptionDowngraded(userId, {
    reason: "subscription_canceled",
    linksDeleted: stats.linksDeleted,
    rulesDeleted: stats.rulesDeleted,
    conditionsDeleted: stats.conditionsDeleted,
    accessesDeleted: stats.accessesDeleted,
  });

  console.log(`✅ User ${userId} successfully downgraded to STANDARD`);
};

const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return errorResponse(res, ERRORS.USER_NOT_FOUND);
    }

    // Check if user is already PRO
    if (user.role === "PRO") {
      return errorResponse(res, {
        code: "ALREADY_PRO",
        message: "User is already on PRO plan",
        statusCode: 400,
      });
    }

    // Create Stripe checkout session
    const { sessionUrl } = await stripeService.createCheckoutSession(
      userId,
      user.email,
      config.stripe.proPriceId
    );

    return successResponse(res, {
      url: sessionUrl,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const createPortalSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return errorResponse(res, ERRORS.USER_NOT_FOUND);
    }

    // Check if user has a subscription with Stripe customer ID
    if (!user.subscription || !user.subscription.stripeCustomerId) {
      return errorResponse(res, {
        code: "NO_STRIPE_CUSTOMER",
        message: "No Stripe customer found for this user",
        statusCode: 400,
      });
    }

    // Create Stripe customer portal session
    const { sessionUrl } = await stripeService.createCustomerPortalSession(
      user.subscription.stripeCustomerId
    );

    return successResponse(res, {
      url: sessionUrl,
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const handleWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    console.error("❌ No Stripe signature header found");
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;

  try {
    // Verify webhook signature and construct event
    event = stripeService.constructWebhookEvent(req.body, signature);
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error.message);
    console.error("   Body type:", typeof req.body);
    console.error("   Body is Buffer:", Buffer.isBuffer(req.body));
    console.error(
      "   Webhook secret configured:",
      !!config.stripe.webhookSecret
    );
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  console.log(`🔔 Received Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    return res.json({ received: true });
  } catch (error) {
    console.error(`❌ Error processing webhook ${event.type}:`, error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};

// Webhook event handlers

const handleCheckoutSessionCompleted = async (session) => {
  const userId = parseInt(session.metadata.userId);
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  console.log(`✅ Checkout completed for user ${userId}`);

  // Get subscription details from Stripe to get price ID and period end
  const stripeInstance = stripeService.initializeStripe();
  const subscription = await stripeInstance.subscriptions.retrieve(
    subscriptionId
  );

  const priceId = subscription.items.data[0].price.id;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Check if subscription exists (to determine if upgrade or new)
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  });
  const isUpgrade = !!existingSubscription;

  // Update user to PRO and create/update subscription
  await prisma.$transaction(async (tx) => {
    // Update user role to PRO
    await tx.user.update({
      where: { id: userId },
      data: { role: "PRO" },
    });

    // Create or update subscription
    if (existingSubscription) {
      await tx.subscription.update({
        where: { userId },
        data: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          status: "ACTIVE",
          currentPeriodEnd: currentPeriodEnd,
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        },
      });
    } else {
      await tx.subscription.create({
        data: {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          status: "ACTIVE",
          currentPeriodEnd: currentPeriodEnd,
          cancelAtPeriodEnd: false,
        },
      });
    }
  });

  // Log subscription creation or upgrade
  const logData = {
    stripeSessionId: session.id,
    stripeSubscriptionId: subscriptionId,
    currentPeriodEnd: currentPeriodEnd,
    source: "stripe_webhook",
    webhookEventId: session.id,
  };

  if (isUpgrade) {
    await auditLog.logSubscriptionUpgraded(userId, logData);
  } else {
    await auditLog.logSubscriptionCreated(userId, logData);
  }

  console.log(`✅ User ${userId} upgraded to PRO`);

  // Send welcome email to user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, username: true, locale: true },
  });

  if (user) {
    await emailService.sendUpgradeToProEmail(
      user.email,
      user.username,
      user.locale
    );

    // Send Telegram notification to admin
    await telegramService.notifyNewSubscription(
      user.email,
      user.username,
      subscription.items.data[0].price.unit_amount || 0,
      currentPeriodEnd
    );
  }
};

const handleSubscriptionUpdated = async (subscription) => {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  console.log(`📝 Subscription updated: ${subscriptionId}`);
  console.log(`   Status: ${subscription.status}`);
  console.log(`   Cancel at period end: ${cancelAtPeriodEnd}`);
  console.log(`   Current period end (raw):`, subscription.current_period_end);

  // Find subscription by Stripe subscription ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    include: { user: true },
  });

  if (!existingSubscription) {
    // This can happen if the webhook arrives before checkout.session.completed
    // It's not an error, just means we haven't created the subscription yet
    console.log(
      `ℹ️  Subscription not found yet for Stripe ID: ${subscriptionId} (may be processed by checkout.session.completed)`
    );
    return;
  }

  // Map Stripe status to our status
  let status = existingSubscription.status;
  if (subscription.status === "active") {
    status = "ACTIVE";
  } else if (subscription.status === "past_due") {
    status = "PAST_DUE";
  } else if (subscription.status === "canceled") {
    status = "CANCELED";
  } else if (subscription.status === "trialing") {
    status = "TRIALING";
  }

  try {
    // Parse current period end - only if it exists
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : existingSubscription.currentPeriodEnd; // Keep existing date if not provided

    // Update subscription
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        updatedAt: new Date(),
      },
    });

    console.log(
      `✅ Subscription ${subscriptionId} updated to status: ${status}, cancelAtPeriodEnd: ${cancelAtPeriodEnd}`
    );

    // If subscription is being canceled (cancel_at_period_end = true),
    // optionally downgrade immediately instead of waiting for period end
    if (cancelAtPeriodEnd && !config.env.isDevelopment) {
      // In production, wait for period end (Stripe will send subscription.deleted webhook)
      console.log(
        `ℹ️  Subscription will cancel at ${currentPeriodEnd?.toISOString()}`
      );

      // Send cancellation email to user
      if (existingSubscription.user) {
        await emailService.sendSubscriptionCancelledEmail(
          existingSubscription.user.email,
          existingSubscription.user.username,
          currentPeriodEnd,
          existingSubscription.user.locale
        );

        // Send Telegram notification to admin
        await telegramService.notifyCancellation(
          existingSubscription.user.email,
          existingSubscription.user.username,
          currentPeriodEnd,
          "user_action"
        );
      }
    } else if (cancelAtPeriodEnd && config.env.isDevelopment) {
      // In development, downgrade immediately for testing
      console.log(
        `⚠️  Development mode: Downgrading user ${existingSubscription.userId} immediately`
      );
      try {
        await executeDowngrade(existingSubscription.userId);
      } catch (downgradeError) {
        console.error(`❌ Error during downgrade:`, downgradeError);
        throw downgradeError;
      }
    }
  } catch (error) {
    console.error(`❌ Error updating subscription ${subscriptionId}:`, error);
    throw error; // Re-throw to trigger 500 response
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  const subscriptionId = subscription.id;

  console.log(`🗑️ Subscription deleted: ${subscriptionId}`);

  // Find subscription by Stripe subscription ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    include: { user: true },
  });

  if (!existingSubscription) {
    console.log(`ℹ️  Subscription not found for Stripe ID: ${subscriptionId}`);
    return;
  }

  // Execute downgrade logic
  await executeDowngrade(existingSubscription.userId);

  console.log(`✅ User ${existingSubscription.userId} downgraded to STANDARD`);
};

const handlePaymentFailed = async (invoice) => {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  console.log(`❌ Payment failed for subscription: ${subscriptionId}`);

  // Find subscription by Stripe subscription ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    include: { user: true },
  });

  if (!existingSubscription) {
    console.log(`ℹ️  Subscription not found for Stripe ID: ${subscriptionId}`);
    return;
  }

  // Update subscription status to PAST_DUE
  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: "PAST_DUE",
      updatedAt: new Date(),
    },
  });

  // Log payment failure
  await auditLog.logPaymentFailed(existingSubscription.userId, {
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
    attemptCount: invoice.attempt_count,
    webhookEventId: invoice.id,
    failureMessage:
      invoice.last_finalization_error?.message || "Payment failed",
  });

  console.log(`⚠️ Subscription ${subscriptionId} marked as PAST_DUE`);

  // Send payment failed email to user
  if (existingSubscription.user) {
    await emailService.sendPaymentFailedEmail(
      existingSubscription.user.email,
      existingSubscription.user.username,
      existingSubscription.user.locale
    );

    // Send Telegram notification to admin
    await telegramService.notifyPaymentFailed(
      existingSubscription.user.email,
      existingSubscription.user.username,
      invoice.amount_due || 0,
      invoice.attempt_count || 1
    );
  }
};

const handlePaymentSucceeded = async (invoice) => {
  const customerId = invoice.customer;
  // Handle both expanded object and string ID cases
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id || invoice.subscription;

  // Skip if invoice is not associated with a subscription (one-time payments)
  if (!subscriptionId || typeof subscriptionId !== "string") {
    console.log(
      `ℹ️  Invoice ${invoice.id} is not associated with a subscription (one-time payment), skipping`
    );
    return;
  }

  console.log(`✅ Payment succeeded for subscription: ${subscriptionId}`);

  // Find subscription by Stripe subscription ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    include: { user: true },
  });

  if (!existingSubscription) {
    console.log(`ℹ️  Subscription not found for Stripe ID: ${subscriptionId}`);
    return;
  }

  // If subscription was PAST_DUE, reactivate it
  if (existingSubscription.status === "PAST_DUE") {
    // Get subscription details from Stripe to get current period end
    const stripeInstance = stripeService.initializeStripe();
    const subscription = await stripeInstance.subscriptions.retrieve(
      subscriptionId
    );

    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : existingSubscription.currentPeriodEnd;

    // Reactivate subscription
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: "ACTIVE",
        currentPeriodEnd: currentPeriodEnd,
        updatedAt: new Date(),
      },
    });

    // Log payment success after failure
    await auditLog.logPaymentSucceeded(existingSubscription.userId, {
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      webhookEventId: invoice.id,
      previousStatus: "PAST_DUE",
    });

    console.log(
      `✅ Subscription ${subscriptionId} reactivated from PAST_DUE to ACTIVE`
    );

    // Send renewal success email (after recovery from PAST_DUE)
    if (existingSubscription.user) {
      const amount = (invoice.amount_paid / 100).toFixed(2); // Convert cents to dollars
      await emailService.sendRenewalSuccessEmail(
        existingSubscription.user.email,
        existingSubscription.user.username,
        currentPeriodEnd,
        amount,
        existingSubscription.user.locale
      );

      // Send Telegram notification to admin (payment recovered)
      await telegramService.notifyPaymentRecovered(
        existingSubscription.user.email,
        existingSubscription.user.username,
        invoice.amount_paid
      );
    }
  } else {
    // Just update the period end if subscription is already active
    const stripeInstance = stripeService.initializeStripe();
    const subscription = await stripeInstance.subscriptions.retrieve(
      subscriptionId
    );

    if (subscription.current_period_end) {
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          currentPeriodEnd: currentPeriodEnd,
          updatedAt: new Date(),
        },
      });

      console.log(`✅ Updated period end for subscription ${subscriptionId}`);

      // Send renewal success email (regular renewal)
      if (existingSubscription.user) {
        const amount = (invoice.amount_paid / 100).toFixed(2); // Convert cents to dollars
        await emailService.sendRenewalSuccessEmail(
          existingSubscription.user.email,
          existingSubscription.user.username,
          currentPeriodEnd,
          amount,
          existingSubscription.user.locale
        );

        // Send Telegram notification to admin (regular renewal)
        await telegramService.notifyRenewalSuccess(
          existingSubscription.user.email,
          existingSubscription.user.username,
          invoice.amount_paid,
          currentPeriodEnd
        );
      }
    }
  }
};

module.exports = {
  getStatus,
  cancelSubscription,
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
  // DEV ONLY - Remove before production
  simulateUpgrade,
  simulateCancel,
  testTelegram,
};
