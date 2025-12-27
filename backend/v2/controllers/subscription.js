const prisma = require("../prisma/client");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
const planLimits = require("../utils/limits");
const config = require("../config/environment");

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
  const STANDARD_LIMITS = planLimits.user;
  const ACCESS_RETENTION_DAYS =
    STANDARD_LIMITS.linkAnalytics.linkAccessesDuration;

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

    await tx.access.deleteMany({
      where: {
        linkId: { in: userLinkIds },
        createdAt: { lt: accessExpirationDate },
      },
    });

    // 3. Handle links over limit (50) - DELETE oldest links
    if (userLinks.length > STANDARD_LIMITS.links) {
      const linksToDelete = userLinks.slice(0, userLinks.length - STANDARD_LIMITS.links);
      const linkIdsToDelete = linksToDelete.map((link) => link.id);

      // Delete oldest links over limit (cascade will delete rules, conditions, and accesses)
      await tx.link.deleteMany({
        where: { id: { in: linkIdsToDelete } },
      });
    }

    // 4. Get remaining links after deletion
    const remainingLinks = userLinks.slice(Math.max(0, userLinks.length - STANDARD_LIMITS.links));

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
};

module.exports = {
  getStatus,
  cancelSubscription,
  // DEV ONLY - Remove before production
  simulateUpgrade,
  simulateCancel,
};
