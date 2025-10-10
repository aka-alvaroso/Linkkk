const prisma = require("../prisma/client");
const { createLinkSchema, updateLinkSchema } = require("../validators/link");
const { isbot } = require("isbot");

const planLimits = require("../utils/limits");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

const { defineCountry, defineIsVPN } = require("../utils/access");

// 1. Create link
const createLink = async (req, res) => {
  const user = req.user;
  const guest = req.guest;
  const isGuest = !!guest;
  const limits = isGuest ? planLimits.guest : planLimits.user;

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

  // Check link limit
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
    console.error("Link creation error:", error);
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

    // Verificar que el usuario tiene permisos (CRÍTICO: evitar null bypass)
    const hasUserAccess = user && link.userId === user.id;
    const hasGuestAccess =
      guest && link.guestSessionId === guest.guestSessionId;

    if (!hasUserAccess && !hasGuestAccess) {
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

    const links = await prisma.link.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!links) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    return successResponse(
      res,
      links.map((link) => ({
        shortUrl: link.shortUrl,
        longUrl: link.longUrl,
        status: link.status,
        createdAt: link.createdAt,
      }))
    );
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

    const hasUserAccess = user && existingLink.userId === user.id;
    const hasGuestAccess =
      guest && existingLink.guestSessionId === guest.guestSessionId;

    if (!hasUserAccess && !hasGuestAccess) {
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

    const hasUserAccess = user && existingLink.userId === user.id;
    const hasGuestAccess =
      guest && existingLink.guestSessionId === guest.guestSessionId;

    if (!hasUserAccess && !hasGuestAccess) {
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
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let shortCode;
  let isUnique = false;

  while (!isUnique) {
    shortCode = "";
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
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

  try {
    const link = await prisma.link.findUnique({
      where: { shortUrl },
    });

    if (!link) {
      return res.redirect(`${process.env.FRONTEND_URL}/404?url=${shortUrl}`);
    }

    // Check status
    if (!link.status) {
      return res.redirect(`${process.env.FRONTEND_URL}/disabled`);
    }

    // Track access
    const country = await defineCountry(ip);
    const isVpn = await defineIsVPN(ip);

    await prisma.access.create({
      data: {
        linkId: link.id,
        userAgent: userAgent || "Unknown",
        ip,
        country: country,
        isVPN: isVpn,
        isBot: isbot(userAgent),
      },
    });

    return res.redirect(302, link.longUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/error`);
  }
};

module.exports = {
  createLink,
  getLink,
  getAllLinks,
  updateLink,
  deleteLink,
  redirectLink,
};
