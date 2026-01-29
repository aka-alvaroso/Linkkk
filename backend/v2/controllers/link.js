const prisma = require("../prisma/client");
const { createLinkSchema, updateLinkSchema } = require("../validators/link");
const { isbot } = require("isbot");

const { getLimitsForUser } = require("../utils/limits");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
const logger = require("../utils/logger");
const config = require("../config/environment");

const { defineCountry, defineIsVPN } = require("../utils/access");
const { evaluateLinkRules, detectDevice } = require("../utils/linkRulesEngine");
const { comparePassword } = require("../utils/password");

// 1. Create link
const createLink = async (req, res) => {
  const user = req.user;
  const guest = req.guest;
  const isGuest = !!guest;
  const limits = getLimitsForUser(user, guest);

  const { longUrl, status } = req.body;

  const validate = createLinkSchema.safeParse(req.body);

  if (!validate.success) {
    const issues = validate.error.issues.map((issue) => {
      return {
        field: issue.path[0],
        message: issue.message,
      };
    });

    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  // Check link limit (skip if unlimited - null)
  if (limits.links !== null) {
    if (isGuest) {
      const count = await prisma.link.count({
        where: {
          guestSessionId: guest.guestSessionId,
        },
      });

      if (count >= limits.links) {
        return errorResponse(res, ERRORS.LINK_LIMIT_EXCEEDED);
      }
    } else {
      const count = await prisma.link.count({
        where: {
          userId: user.id,
        },
      });

      if (count >= limits.links) {
        return errorResponse(res, ERRORS.LINK_LIMIT_EXCEEDED);
      }
    }
  }

  const shortUrl = await generateShortCode();

  try {
    const link = await prisma.link.create({
      data: {
        userId: user?.id,
        guestSessionId: guest?.guestSessionId,
        longUrl,
        status: status ?? true,
        shortUrl,
      },
    });
    return successResponse(res, link, 201);
  } catch (error) {
    if (error.code === "P2002") {
      // Prisma unique constraint error
      return errorResponse(res, ERRORS.SHORT_URL_EXISTS);
    }
    logger.error('Link creation error', { error: error.message, stack: error.stack });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 2. Get link
const getLink = async (req, res) => {
  const { shortUrl } = req.params;
  const guest = req.guest;
  const user = req.user;

  try {
    const link = await prisma.link.findUnique({
      where: {
        shortUrl,
      },
    });

    if (!link) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    // SECURITY: Strict authorization check with null validation (prevents BOLA)
    let hasAccess = false;

    // User access: Both IDs must exist and match
    if (user?.id && link.userId && link.userId === user.id) {
      hasAccess = true;
    }

    // Guest access: Both IDs must exist and match
    if (!hasAccess && guest?.guestSessionId && link.guestSessionId &&
        link.guestSessionId === guest.guestSessionId) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    return successResponse(res, {
      shortUrl: link.shortUrl,
      longUrl: link.longUrl,
      status: link.status,
      createdAt: link.createdAt,
    });
  } catch (error) {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 3. Get all links
const getAllLinks = async (req, res) => {
  try {
    const user = req.user;
    const guest = req.guest;

    const whereClause = {};
    if (user) {
      whereClause.userId = user.id;
    } else if (guest) {
      whereClause.guestSessionId = guest.guestSessionId;
    } else {
      return errorResponse(res, ERRORS.UNAUTHORIZED);
    }

    // Get all links
    const links = await prisma.link.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!links) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    // Get total access count and QR scan count in parallel
    const linkIds = links.map((l) => l.id);

    const [totalAccessCount, totalScanCount, scanCounts] = await Promise.all([
      prisma.access.count({
        where: { link: whereClause },
      }),
      prisma.access.count({
        where: { link: whereClause, source: "qr" },
      }),
      prisma.access.groupBy({
        by: ["linkId"],
        where: { linkId: { in: linkIds }, source: "qr" },
        _count: { id: true },
      }),
    ]);

    const scanCountMap = new Map(
      scanCounts.map((sc) => [sc.linkId, sc._count.id])
    );

    return successResponse(res, {
      links: links.map((link) => ({
        shortUrl: link.shortUrl,
        longUrl: link.longUrl,
        status: link.status,
        createdAt: link.createdAt,
        accessCount: link.accessCount,
        scanCount: scanCountMap.get(link.id) || 0,
      })),
      stats: {
        totalClicks: totalAccessCount,
        totalScans: totalScanCount,
      },
    });
  } catch (error) {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 4. Update link
const updateLink = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;
  const guest = req.guest;

  const { longUrl, status } = req.body;

  const validatedData = updateLinkSchema.safeParse(req.body);

  if (!validatedData.success) {
    const issues = validatedData.error.issues.map((issue) => ({
      field: issue.path[0],
      message: issue.message,
    }));

    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  try {
    const existingLink = await prisma.link.findUnique({
      where: { shortUrl },
    });

    if (!existingLink) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    // SECURITY: Strict authorization check with null validation (prevents BOLA)
    let hasAccess = false;

    // User access: Both IDs must exist and match
    if (user?.id && existingLink.userId && existingLink.userId === user.id) {
      hasAccess = true;
    }

    // Guest access: Both IDs must exist and match
    if (!hasAccess && guest?.guestSessionId && existingLink.guestSessionId &&
        existingLink.guestSessionId === guest.guestSessionId) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    const updateData = {};
    if (longUrl !== undefined) updateData.longUrl = longUrl;
    if (status !== undefined) updateData.status = status;

    const updatedLink = await prisma.link.update({
      where: { shortUrl },
      data: updateData,
    });

    return successResponse(res, {
      shortUrl: updatedLink.shortUrl,
      longUrl: updatedLink.longUrl,
      status: updatedLink.status,
      createdAt: updatedLink.createdAt,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return errorResponse(res, ERRORS.SHORT_URL_EXISTS);
    }
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 6. Delete link
const deleteLink = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;
  const guest = req.guest;

  try {
    const existingLink = await prisma.link.findUnique({
      where: { shortUrl },
    });

    if (!existingLink) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    // SECURITY: Strict authorization check with null validation (prevents BOLA)
    let hasAccess = false;

    // User access: Both IDs must exist and match
    if (user?.id && existingLink.userId && existingLink.userId === user.id) {
      hasAccess = true;
    }

    // Guest access: Both IDs must exist and match
    if (!hasAccess && guest?.guestSessionId && existingLink.guestSessionId &&
        existingLink.guestSessionId === guest.guestSessionId) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    const deletedLink = await prisma.link.delete({
      where: { shortUrl },
    });

    return successResponse(res, deletedLink);
  } catch (error) {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const generateShortCode = async () => {
  // SECURITY: Use crypto.randomBytes instead of Math.random for cryptographically secure codes
  const crypto = require('crypto');
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let shortCode;
  let isUnique = false;

  while (!isUnique) {
    shortCode = "";
    // Generate 8 cryptographically random bytes
    const randomBytes = crypto.randomBytes(8);

    for (let i = 0; i < 8; i++) {
      // Use each byte to select a character from our alphabet
      const randomIndex = randomBytes[i] % characters.length;
      shortCode += characters.charAt(randomIndex);
    }

    // Verificar que el código sea único
    const existingLink = await prisma.link.findUnique({
      where: { shortUrl: shortCode },
    });

    if (!existingLink) {
      isUnique = true;
    }
  }

  return shortCode;
};

// 5. Link redirect
const redirectLink = async (req, res) => {
  const { shortUrl } = req.params;
  const userAgent = req.headers["user-agent"];
  const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;
  const source = req.query.src === 'qr' ? 'qr' : 'direct';

  try {
    // SECURITY NOTE: Race condition mitigation
    // There's a small window between reading accessCount and incrementing it
    // under very high concurrent load. Full fix would require SELECT FOR UPDATE
    // inside transaction, but this would slow down ALL redirects due to external
    // API calls (country lookup, VPN check). Current trade-off accepts ~1-2%
    // inaccuracy under extreme load for better performance.
    // For critical access limits, implement additional server-side validation.

    // Fetch link with rules
    const link = await prisma.link.findUnique({
      where: { shortUrl },
      include: {
        rules: {
          where: { enabled: true },
          include: {
            conditions: true,
          },
          orderBy: { priority: "asc" },
        },
      },
    });

    if (!link) {
      return res.redirect(`${config.frontend.url}/404?url=${shortUrl}`);
    }

    // Check status
    if (!link.status) {
      return res.redirect(`${config.frontend.url}/disabled`);
    }

    // Build evaluation context
    const country = await defineCountry(ip);
    const isVpn = await defineIsVPN(ip);
    const device = detectDevice(userAgent);
    const isBot = isbot(userAgent);

    const context = {
      country,
      device,
      ip,
      isVPN: isVpn,
      isBot,
      currentDate: new Date(),
      accessCount: link.accessCount,
    };

    // Evaluate link rules with timeout protection
    let allowed = true;
    let action = null;

    try {
      const RULE_EVALUATION_TIMEOUT = 5000; // 5 seconds max

      const evaluationPromise = evaluateLinkRules(link, context);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Rule evaluation timeout")),
          RULE_EVALUATION_TIMEOUT
        )
      );

      const evaluationResult = await Promise.race([
        evaluationPromise,
        timeoutPromise,
      ]);
      allowed = evaluationResult.allowed;
      action = evaluationResult.action;
    } catch (ruleError) {
      logger.error('[CRITICAL] Rule evaluation failed', {
        shortUrl,
        error: ruleError.message || ruleError,
      });

      // TODO: Implement email notification to link owner when rule evaluation fails
      // This will help owners know when their rules are broken and links are falling back to default behavior

      // Fallback to default redirect (fail-open approach)
      action = {
        type: "redirect",
        url: link.longUrl,
      };
    }

    // Apply action based on type
    switch (action.type) {
      case "redirect":
        // Track access and increment counter atomically (prevents race condition)
        await prisma.$transaction(async (tx) => {
          await tx.access.create({
            data: {
              linkId: link.id,
              userAgent: userAgent || "Unknown",
              ip,
              country,
              isVPN: isVpn,
              isBot,
              source,
            },
          });

          await tx.link.update({
            where: { id: link.id },
            data: { accessCount: { increment: 1 } },
          });
        });

        return res.redirect(302, action.url);

      case "block":
        // Only increment counter (don't track full access for blocked requests)
        await prisma.link.update({
          where: { id: link.id },
          data: { accessCount: { increment: 1 } },
        });

        return res.redirect(
          `${
            config.frontend.url
          }/blocked?url=${shortUrl}&reason=${encodeURIComponent(action.reason)}`
        );

      case "password_gate":
        // DO NOT increment counter here - it will be incremented after successful password verification
        // This prevents counting failed password attempts as actual access
        return res.redirect(
          `${config.frontend.url}/password?shortUrl=${shortUrl}${
            action.hint ? `&hint=${encodeURIComponent(action.hint)}` : ""
          }${source === 'qr' ? '&src=qr' : ''}`
        );

      case "notify":
        // Send webhook notification (non-blocking)
        if (action.webhookUrl) {
          const { isValidWebhookUrl } = require("../utils/webhookValidator");

          // SECURITY: Validate webhook URL to prevent SSRF attacks
          if (!isValidWebhookUrl(action.webhookUrl)) {
            logger.security('[SECURITY] Blocked SSRF attempt on webhook', {
              webhookUrl: action.webhookUrl,
              shortUrl: link.shortUrl,
            });
            // Don't send webhook, but continue with access tracking and redirect below
          } else {
            const webhookPayload = {
              event: "link_accessed",
              link: {
                shortUrl: link.shortUrl,
                longUrl: link.longUrl,
              },
              timestamp: new Date().toISOString(),
              context: {
                country,
                device,
                ip,
                isBot,
                isVPN: isVpn,
                accessCount: link.accessCount,
              },
              customMessage: action.message || null,
            };

            // Send webhook asynchronously (don't await, don't block redirect)
            fetch(action.webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "User-Agent": "Linkkk-Webhook/1.0",
              },
              body: JSON.stringify(webhookPayload),
              signal: AbortSignal.timeout(5000), // 5 second timeout
            }).catch((error) => {
              // Log error but don't fail the request
              logger.warn('[NOTIFY] Webhook failed', {
                shortUrl: link.shortUrl,
                webhookUrl: action.webhookUrl,
                error: error.message,
              });
            });
          }
        }

        // Continue with normal redirect (notify is non-blocking)
        // Track access and increment counter atomically (prevents race condition)
        await prisma.$transaction(async (tx) => {
          await tx.access.create({
            data: {
              linkId: link.id,
              userAgent: userAgent || "Unknown",
              ip,
              country,
              isVPN: isVpn,
              isBot,
              source,
            },
          });

          await tx.link.update({
            where: { id: link.id },
            data: { accessCount: { increment: 1 } },
          });
        });

        return res.redirect(302, link.longUrl);

      default:
        // Unknown action type - fallback to redirect
        logger.warn('Unknown action type', { actionType: action.type, shortUrl });

        // Track access and increment counter atomically (prevents race condition)
        await prisma.$transaction(async (tx) => {
          await tx.access.create({
            data: {
              linkId: link.id,
              userAgent: userAgent || "Unknown",
              ip,
              country,
              isVPN: isVpn,
              isBot,
              source,
            },
          });

          await tx.link.update({
            where: { id: link.id },
            data: { accessCount: { increment: 1 } },
          });
        });

        return res.redirect(302, link.longUrl);
    }
  } catch (error) {
    logger.error('Redirect error', { shortUrl, error: error.message, stack: error.stack });
    return res.redirect(`${config.frontend.url}/error`);
  }
};

// 7. Verify password for password_gate action
const verifyPasswordGate = async (req, res) => {
  const { shortUrl } = req.params;
  const { password } = req.body;
  const userAgent = req.headers["user-agent"];
  const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;
  const source = req.body.src === 'qr' ? 'qr' : 'direct';

  try {
    // Validate input
    if (!password || typeof password !== "string") {
      return errorResponse(res, ERRORS.INVALID_DATA, [
        { field: "password", message: "Password is required" },
      ]);
    }

    // Fetch link with rules
    const link = await prisma.link.findUnique({
      where: { shortUrl },
      include: {
        rules: {
          where: {
            enabled: true,
            actionType: "password_gate",
          },
          include: {
            conditions: true,
          },
          orderBy: { priority: "asc" },
        },
      },
    });

    // Use generic error for all failure cases to prevent enumeration attacks
    const GENERIC_ACCESS_DENIED = {
      code: "ACCESS_DENIED",
      message: "Access denied",
      userMessage: "Invalid link or password",
      statusCode: 403,
      retryable: false,
    };

    if (!link || !link.status) {
      // Don't reveal if link exists or is disabled - use generic error
      return errorResponse(res, GENERIC_ACCESS_DENIED);
    }

    // Build evaluation context to find which rule should apply
    const country = await defineCountry(ip);
    const isVpn = await defineIsVPN(ip);
    const device = detectDevice(userAgent);
    const isBot = isbot(userAgent);

    const context = {
      country,
      device,
      ip,
      isVPN: isVpn,
      isBot,
      currentDate: new Date(),
      accessCount: link.accessCount,
    };

    // Evaluate rules to get the correct password_gate action
    let passwordHash = null;
    let redirectUrl = link.longUrl;

    try {
      const { action } = await evaluateLinkRules(link, context);

      if (action.type !== "password_gate") {
        // Don't reveal that link exists but has no password - use generic error
        return errorResponse(res, GENERIC_ACCESS_DENIED);
      }

      passwordHash = action.passwordHash;
    } catch (error) {
      logger.error('Error evaluating rules for password verification', {
        shortUrl,
        error: error.message,
      });
      return errorResponse(res, ERRORS.INTERNAL_ERROR);
    }

    // Verify password
    const isValid = await comparePassword(password, passwordHash);

    if (!isValid) {
      // Use same generic error for invalid password
      return errorResponse(res, GENERIC_ACCESS_DENIED);
    }

    // Password is correct - track access AND increment counter atomically
    // Counter is only incremented on successful authentication to prevent inflated analytics
    await prisma.$transaction(async (tx) => {
      await tx.access.create({
        data: {
          linkId: link.id,
          userAgent: userAgent || "Unknown",
          ip,
          country,
          isVPN: isVpn,
          isBot,
        },
      });

      await tx.link.update({
        where: { id: link.id },
        data: { accessCount: { increment: 1 } },
      });
    });

    return successResponse(res, {
      success: true,
      url: redirectUrl,
    });
  } catch (error) {
    logger.error('Password verification error', {
      shortUrl,
      error: error.message,
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

module.exports = {
  createLink,
  getLink,
  getAllLinks,
  updateLink,
  deleteLink,
  redirectLink,
  verifyPasswordGate,
};
