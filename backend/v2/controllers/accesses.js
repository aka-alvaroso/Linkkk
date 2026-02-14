const prisma = require("../prisma/client");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

const getLinkAccesses = async (req, res) => {
  const user = req.user;
  const guest = req.guest;

  try {
    const link = await prisma.link.findUnique({
      where: {
        shortUrl: req.params.shortUrl,
      },
    });

    if (!link) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    const hasUserAccess = user && link.userId === user.id;
    const hasGuestAccess =
      guest && link.guestSessionId === guest.guestSessionId;

    if (!hasUserAccess && !hasGuestAccess) {
      return errorResponse(res, ERRORS.UNAUTHORIZED);
    }

    // GUESTS don't have access to analytics (but authenticated users with a lingering guest cookie should)
    if (guest && !user) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    // Determine access limit based on user role
    let limit = null; // null = unlimited (PRO)
    if (user.role === 'STANDARD') {
      limit = 20;
    }

    // Query accesses with role-based limit
    const accesses = await prisma.access.findMany({
      where: {
        linkId: link.id,
      },
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
      ...(limit && { take: limit }), // Apply limit only if not null
    });

    return successResponse(res, accesses);
  } catch (error) {
    console.error("Error fetching accesses:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const DEMO_SHORT_URLS = ["demo-detection"];

const getDemoAccesses = async (req, res) => {
  try {
    const { shortUrl } = req.params;

    if (!DEMO_SHORT_URLS.includes(shortUrl)) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    const link = await prisma.link.findUnique({
      where: { shortUrl },
    });

    if (!link) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    const accesses = await prisma.access.findMany({
      where: { linkId: link.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        userAgent: true,
        country: true,
        isVPN: true,
        isBot: true,
        source: true,
      },
    });

    return successResponse(res, accesses);
  } catch (error) {
    console.error("Error fetching demo accesses:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

module.exports = {
  getLinkAccesses,
  getDemoAccesses,
};
