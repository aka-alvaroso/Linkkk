const prisma = require("../prisma/client");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

const getDailyClicks = async (req, res) => {
  const user = req.user;
  const guest = req.guest;

  if (!user && !guest) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  // Guests don't have access to analytics
  if (guest && !user) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 7, 1), 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Get all link IDs owned by this user
    const userLinks = await prisma.link.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const linkIds = userLinks.map((l) => l.id);

    // Generate all dates in range
    const allDates = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      allDates.push(d.toISOString().split("T")[0]);
    }

    if (linkIds.length === 0) {
      return successResponse(
        res,
        allDates.map((date) => ({ date, clicks: 0 }))
      );
    }

    // Query access records grouped by date
    const results = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as clicks
      FROM "Access"
      WHERE "linkId" = ANY(${linkIds})
        AND "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Build a map of date -> clicks
    const clicksMap = {};
    for (const row of results) {
      const dateStr =
        row.date instanceof Date
          ? row.date.toISOString().split("T")[0]
          : String(row.date);
      clicksMap[dateStr] = row.clicks;
    }

    // Fill in missing days with 0
    const filledResults = allDates.map((date) => ({
      date,
      clicks: clicksMap[date] || 0,
    }));

    return successResponse(res, filledResults);
  } catch (error) {
    console.error("Error fetching daily clicks:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

module.exports = {
  getDailyClicks,
};
