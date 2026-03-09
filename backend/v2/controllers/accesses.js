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

    // Query all accesses (retention is enforced by the nightly cleanup job)
    const accesses = await prisma.access.findMany({
      where: {
        linkId: link.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
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

const parseBrowser = (userAgent) => {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  return 'Other';
};

const getLinkStats = async (req, res) => {
  const user = req.user;
  const guest = req.guest;
  const { period } = req.query; // '7d' | '30d' | 'all'

  try {
    const link = await prisma.link.findUnique({ where: { shortUrl: req.params.shortUrl } });

    if (!link) return errorResponse(res, ERRORS.LINK_NOT_FOUND);

    const hasUserAccess = user && link.userId === user.id;
    const hasGuestAccess = guest && link.guestSessionId === guest.guestSessionId;

    if (!hasUserAccess && !hasGuestAccess) return errorResponse(res, ERRORS.UNAUTHORIZED);
    if (guest && !user) return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);

    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : null;
    const since = periodDays ? new Date(now - periodDays * 24 * 60 * 60 * 1000) : null;

    const accesses = await prisma.access.findMany({
      where: {
        linkId: link.id,
        ...(since && { createdAt: { gte: since } }),
      },
      select: { createdAt: true, country: true, source: true, userAgent: true, isVPN: true, isBot: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build full date range filled with zeros
    const days = periodDays ?? Math.max(
      1,
      accesses.length > 0
        ? Math.ceil((now - new Date(accesses[0].createdAt)) / (24 * 60 * 60 * 1000)) + 1
        : 7
    );
    const dateMap = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dateMap[d.toISOString().split('T')[0]] = 0;
    }

    const countries = {};
    const browsers = {};
    let vpnCount = 0, botCount = 0, qrCount = 0, directCount = 0;

    for (const a of accesses) {
      const day = new Date(a.createdAt).toISOString().split('T')[0];
      if (dateMap[day] !== undefined) dateMap[day]++;
      countries[a.country] = (countries[a.country] || 0) + 1;
      const b = parseBrowser(a.userAgent);
      browsers[b] = (browsers[b] || 0) + 1;
      if (a.source === 'qr') qrCount++; else directCount++;
      if (a.isVPN) vpnCount++;
      if (a.isBot) botCount++;
    }

    const topCountries = Object.entries(countries)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const browserBreakdown = Object.entries(browsers)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    return successResponse(res, {
      totalClicks: accesses.length,
      totalScans: link.scanCount ?? 0,
      clicksByDay: Object.entries(dateMap).map(([date, count]) => ({ date, count })),
      topCountries,
      sourceBreakdown: { direct: directCount, qr: qrCount },
      browserBreakdown,
      vpnCount,
      botCount,
    });
  } catch (error) {
    console.error('Error fetching link stats:', error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

module.exports = {
  getLinkAccesses,
  getDemoAccesses,
  getLinkStats,
};
