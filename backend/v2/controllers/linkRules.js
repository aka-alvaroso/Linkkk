const prisma = require("../prisma/client");
const {
  createLinkRuleSchema,
  updateLinkRuleSchema,
  createMultipleLinkRulesSchema,
  ruleIdParamSchema,
} = require("../validators/linkRules");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
const planLimits = require("../utils/limits");

// Helper: Check link access
const checkLinkAccess = async (shortUrl, user, guest) => {
  const link = await prisma.link.findUnique({
    where: { shortUrl },
  });

  if (!link) {
    return { link: null, hasAccess: false, error: ERRORS.LINK_NOT_FOUND };
  }

  const hasUserAccess = user && link.userId === user.id;
  const hasGuestAccess = guest && link.guestSessionId === guest.guestSessionId;

  if (!hasUserAccess && !hasGuestAccess) {
    return { link, hasAccess: false, error: ERRORS.LINK_ACCESS_DENIED };
  }

  return { link, hasAccess: true };
};

// ============================================
// CRUD OPERATIONS
// ============================================

// 1. Create link rule
const createLinkRule = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;
  const guest = req.guest;

  // Check link access
  const { link, hasAccess, error } = await checkLinkAccess(shortUrl, user, guest);
  if (!hasAccess) {
    return errorResponse(res, error);
  }

  // Validate rule data
  const validate = createLinkRuleSchema.safeParse(req.body);
  if (!validate.success) {
    const issues = validate.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  const { priority, enabled, match, conditions, action, elseAction } = validate.data;

  // Check rule limit per link
  const isGuest = !!guest;
  const limits = isGuest ? planLimits.guest : planLimits.user;

  const existingRuleCount = await prisma.linkRule.count({
    where: { linkId: link.id }
  });

  if (existingRuleCount >= limits.rulesPerLink) {
    return errorResponse(res, {
      code: "RULE_LIMIT_EXCEEDED",
      message: "Rule limit exceeded",
      userMessage: `You can only create ${limits.rulesPerLink} rules per link`,
      statusCode: 400,
      retryable: false,
    });
  }

  try {
    // Create rule with conditions
    const rule = await prisma.linkRule.create({
      data: {
        linkId: link.id,
        priority: priority ?? 0,
        enabled: enabled ?? true,
        match: match ?? "AND",
        actionType: action.type,
        actionSettings: action.settings || {},
        elseActionType: elseAction?.type,
        elseActionSettings: elseAction?.settings || null,
      },
    });

    // Create conditions separately
    if (conditions && conditions.length > 0) {
      await prisma.ruleCondition.createMany({
        data: conditions.map((cond) => ({
          ruleId: rule.id,
          field: cond.field,
          operator: cond.operator,
          value: cond.value,
        })),
      });
    }

    // Fetch complete rule with conditions
    const completeRule = await prisma.linkRule.findUnique({
      where: { id: rule.id },
      include: {
        conditions: true,
      },
    });

    return successResponse(res, completeRule, 201);
  } catch (error) {
    console.error("Create rule error:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 2. Get all rules for a link
const getLinkRules = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;
  const guest = req.guest;

  // Check link access
  const { link, hasAccess, error } = await checkLinkAccess(shortUrl, user, guest);
  if (!hasAccess) {
    return errorResponse(res, error);
  }

  try {
    const rules = await prisma.linkRule.findMany({
      where: { linkId: link.id },
      include: {
        conditions: true,
      },
      orderBy: {
        priority: "asc",
      },
    });

    return successResponse(res, rules);
  } catch (error) {
    console.error("Get rules error:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 3. Get single rule
const getLinkRule = async (req, res) => {
  const { shortUrl, ruleId } = req.params;
  const user = req.user;
  const guest = req.guest;

  // Validate ruleId parameter
  const paramValidation = ruleIdParamSchema.safeParse({ ruleId });
  if (!paramValidation.success) {
    const issues = paramValidation.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  const validatedRuleId = paramValidation.data.ruleId;

  // Check link access
  const { link, hasAccess, error } = await checkLinkAccess(shortUrl, user, guest);
  if (!hasAccess) {
    return errorResponse(res, error);
  }

  try {
    const rule = await prisma.linkRule.findFirst({
      where: {
        id: validatedRuleId,
        linkId: link.id,
      },
      include: {
        conditions: true,
      },
    });

    if (!rule) {
      return errorResponse(res, ERRORS.RULE_NOT_FOUND);
    }

    return successResponse(res, rule);
  } catch (error) {
    console.error("Get rule error:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 4. Update link rule
const updateLinkRule = async (req, res) => {
  const { shortUrl, ruleId } = req.params;
  const user = req.user;
  const guest = req.guest;

  // Validate ruleId parameter
  const paramValidation = ruleIdParamSchema.safeParse({ ruleId });
  if (!paramValidation.success) {
    const issues = paramValidation.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  const validatedRuleId = paramValidation.data.ruleId;

  // Check link access
  const { link, hasAccess, error } = await checkLinkAccess(shortUrl, user, guest);
  if (!hasAccess) {
    return errorResponse(res, error);
  }

  // Validate update data
  const validate = updateLinkRuleSchema.safeParse(req.body);
  if (!validate.success) {
    const issues = validate.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  try {
    // Check rule exists and belongs to link
    const existingRule = await prisma.linkRule.findFirst({
      where: {
        id: validatedRuleId,
        linkId: link.id,
      },
    });

    if (!existingRule) {
      return errorResponse(res, ERRORS.RULE_NOT_FOUND);
    }

    const { priority, enabled, match, conditions, action, elseAction } = validate.data;

    // Build update data
    const updateData = {};
    if (priority !== undefined) updateData.priority = priority;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (match !== undefined) updateData.match = match;
    if (action) {
      updateData.actionType = action.type;
      updateData.actionSettings = action.settings || {};
    }
    if (elseAction !== undefined) {
      updateData.elseActionType = elseAction?.type || null;
      updateData.elseActionSettings = elseAction?.settings || null;
    }

    // Update rule
    const updatedRule = await prisma.linkRule.update({
      where: { id: validatedRuleId },
      data: updateData,
    });

    // Update conditions if provided
    if (conditions !== undefined) {
      // Delete existing conditions
      await prisma.ruleCondition.deleteMany({
        where: { ruleId: updatedRule.id },
      });

      // Create new conditions
      if (conditions.length > 0) {
        await prisma.ruleCondition.createMany({
          data: conditions.map((cond) => ({
            ruleId: updatedRule.id,
            field: cond.field,
            operator: cond.operator,
            value: cond.value,
          })),
        });
      }
    }

    // Fetch complete rule with conditions
    const completeRule = await prisma.linkRule.findUnique({
      where: { id: updatedRule.id },
      include: {
        conditions: true,
      },
    });

    return successResponse(res, completeRule);
  } catch (error) {
    console.error("Update rule error:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 5. Delete link rule
const deleteLinkRule = async (req, res) => {
  const { shortUrl, ruleId } = req.params;
  const user = req.user;
  const guest = req.guest;

  // Validate ruleId parameter
  const paramValidation = ruleIdParamSchema.safeParse({ ruleId });
  if (!paramValidation.success) {
    const issues = paramValidation.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  const validatedRuleId = paramValidation.data.ruleId;

  // Check link access
  const { link, hasAccess, error } = await checkLinkAccess(shortUrl, user, guest);
  if (!hasAccess) {
    return errorResponse(res, error);
  }

  try {
    // Check rule exists and belongs to link
    const existingRule = await prisma.linkRule.findFirst({
      where: {
        id: validatedRuleId,
        linkId: link.id,
      },
    });

    if (!existingRule) {
      return errorResponse(res, ERRORS.RULE_NOT_FOUND);
    }

    // Delete rule (conditions will be deleted automatically via cascade)
    await prisma.linkRule.delete({
      where: { id: validatedRuleId },
    });

    return successResponse(res, { message: "Rule deleted successfully" });
  } catch (error) {
    console.error("Delete rule error:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// ============================================
// BATCH OPERATIONS
// ============================================

// 6. Create multiple rules at once
const createMultipleLinkRules = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;
  const guest = req.guest;

  // Check link access
  const { link, hasAccess, error } = await checkLinkAccess(shortUrl, user, guest);
  if (!hasAccess) {
    return errorResponse(res, error);
  }

  // Validate batch data
  const validate = createMultipleLinkRulesSchema.safeParse(req.body);
  if (!validate.success) {
    const issues = validate.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  const { rules } = validate.data;

  // Check rule limit per link
  const isGuest = !!guest;
  const limits = isGuest ? planLimits.guest : planLimits.user;

  const existingRuleCount = await prisma.linkRule.count({
    where: { linkId: link.id }
  });

  if (existingRuleCount + rules.length > limits.rulesPerLink) {
    return errorResponse(res, {
      code: "RULE_LIMIT_EXCEEDED",
      message: "Rule limit exceeded",
      userMessage: `This would exceed the limit of ${limits.rulesPerLink} rules per link (current: ${existingRuleCount}, adding: ${rules.length})`,
      statusCode: 400,
      retryable: false,
    });
  }

  try {
    // Wrap all rule creation in a single transaction for atomicity
    // If any rule fails, all changes are rolled back
    const createdRules = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const ruleData of rules) {
        const rule = await tx.linkRule.create({
          data: {
            linkId: link.id,
            priority: ruleData.priority ?? 0,
            enabled: ruleData.enabled ?? true,
            match: ruleData.match ?? "AND",
            actionType: ruleData.action.type,
            actionSettings: ruleData.action.settings || {},
            elseActionType: ruleData.elseAction?.type,
            elseActionSettings: ruleData.elseAction?.settings || null,
          },
        });

        // Create conditions
        if (ruleData.conditions && ruleData.conditions.length > 0) {
          await tx.ruleCondition.createMany({
            data: ruleData.conditions.map((cond) => ({
              ruleId: rule.id,
              field: cond.field,
              operator: cond.operator,
              value: cond.value,
            })),
          });
        }

        // Fetch complete rule with conditions
        const completeRule = await tx.linkRule.findUnique({
          where: { id: rule.id },
          include: {
            conditions: true,
          },
        });

        results.push(completeRule);
      }

      return results;
    });

    return successResponse(res, createdRules, 201);
  } catch (error) {
    console.error("Batch create rules error:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

module.exports = {
  createLinkRule,
  getLinkRules,
  getLinkRule,
  updateLinkRule,
  deleteLinkRule,
  createMultipleLinkRules,
};
