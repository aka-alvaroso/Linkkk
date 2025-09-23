const prisma = require("../prisma/client");
const { createLinkSchema, updateLinkSchema } = require("../validators/link");
const bcryptjs = require("bcryptjs");

const planLimits = require("../utils/limits");
const { successResponse, errorResponse } = require("../utils/response");

// 1. Create link
const createLink = async (req, res) => {
  const user = req.user;
  const guest = req.guest;
  const isGuest = !!guest;
  const limits = isGuest ? planLimits.guest : planLimits.user;

  const {
    longUrl,
    password,
    accessLimit,
    blockedCountries,
    mobileUrl,
    desktopUrl,
    sufix,
    expirationDate,
    metadataTitle,
    metadataDescription,
    metadataImage,
  } = req.body;

  const validate = createLinkSchema.safeParse(req.body);

  if (!validate.success) {
    const issues = validate.error.issues.map((issue) => {
      return {
        field: issue.path[0],
        message: issue.message,
      };
    });

    return errorResponse(
      res,
      {
        code: "LINK_CREATION_INVALID_DATA",
        message: "Data validation failed",
        statusCode: 400,
      },
      issues
    );
  }

  if (isGuest) {
    const count = await prisma.link.count({
      where: {
        guestSessionId: guest.guestSessionId,
      },
    });

    if (count >= limits.links) {
      return errorResponse(res, {
        code: "LINK_LIMIT_EXCEEDED",
        message: "Link limit exceeded",
        statusCode: 400,
      });
    }
  } else {
    const count = await prisma.link.count({
      where: {
        userId: user.id,
        dateExpire: { lt: new Date() },
      },
    });

    if (count >= limits.links) {
      return errorResponse(res, {
        code: "LINK_LIMIT_EXCEEDED",
        message: "Link limit exceeded",
        statusCode: 400,
      });
    }
  }

  const data = {};
  if (longUrl !== undefined) data.longUrl = longUrl;
  if (metadataTitle !== undefined && limits.metadata)
    data.metadataTitle = metadataTitle;
  if (metadataDescription !== undefined && limits.metadata)
    data.metadataDescription = metadataDescription;
  if (metadataImage !== undefined && limits.metadata)
    data.metadataImage = metadataImage;
  if (password !== undefined && limits.password) {
    data.password = password ? await bcryptjs.hash(password, 10) : null;
  }
  if (accessLimit !== undefined && limits.accessLimit)
    data.accessLimit = accessLimit;
  if (mobileUrl !== undefined && limits.smartRedirection)
    data.mobileUrl = mobileUrl;
  if (desktopUrl !== undefined && limits.smartRedirection)
    data.desktopUrl = desktopUrl;
  if (sufix !== undefined && limits.sufix) {
    if (sufix) {
      const existingSufix = await prisma.link.findFirst({
        where: {
          sufix: sufix.toLowerCase(),
        },
      });

      if (existingSufix) {
        return errorResponse(res, {
          code: "SUFIX_ALREADY_EXISTS",
          message: "This custom URL is already taken",
          statusCode: 400,
        });
      }
      data.sufix = sufix.toLowerCase();
    }
  }
  if (expirationDate !== undefined && limits.expirationDate)
    data.dateExpire = expirationDate;
  if (blockedCountries !== undefined && limits.blockedCountries)
    data.blockedCountries = blockedCountries;

  const shortUrl = await generateShortCode();

  try {
    const link = await prisma.link.create({
      data: {
        userId: user?.id,
        guestSessionId: guest?.guestSessionId,
        ...data,
        shortUrl,
      },
    });
    return successResponse(res, link, 201);
  } catch (error) {
    console.error("Link creation error:", error);
    return errorResponse(res, {
      code: "LINK_CREATION_ERROR",
      message: "Error creating link",
      statusCode: 500,
    });
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
      return errorResponse(res, {
        code: "LINK_NOT_FOUND",
        message: "Link not found",
        statusCode: 404,
      });
    }

    // Verificar que el usuario tiene permisos (CRÍTICO: evitar null bypass)
    const hasUserAccess = user && link.userId === user.id;
    const hasGuestAccess =
      guest && link.guestSessionId === guest.guestSessionId;

    if (!hasUserAccess && !hasGuestAccess) {
      return errorResponse(res, {
        code: "LINK_NOT_FOUND",
        message: "Link not found",
        statusCode: 404,
      });
    }

    return successResponse(res, link);
  } catch (error) {
    return errorResponse(res, {
      code: "LINK_INFO_ERROR",
      message: "Error getting link info",
      statusCode: 500,
    });
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
      return errorResponse(res, {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
        statusCode: 401,
      });
    }

    const links = await prisma.link.findMany({
      where: whereClause,
    });

    if (!links) {
      return errorResponse(res, {
        code: "LINK_NOT_FOUND",
        message: "Links not found",
        statusCode: 404,
      });
    }

    return successResponse(res, links);
  } catch (error) {
    return errorResponse(res, {
      code: "LINK_INFO_ERROR",
      message: "Error getting link info",
      statusCode: 500,
    });
  }
};

// 4. Validate link password
const validateLinkPassword = async (req, res) => {
  const { shortUrl } = req.params;
  const { password } = req.body;
  const guest = req.guest;
  const user = req.user;

  try {
    // Buscar el link
    const link = await prisma.link.findUnique({
      where: {
        shortUrl,
      },
    });

    if (!link) {
      return errorResponse(res, {
        code: "LINK_NOT_FOUND",
        message: "Link not found",
        statusCode: 404,
      });
    }

    const hasUserAccess = user && link.userId === user.id;
    const hasGuestAccess =
      guest && link.guestSessionId === guest.guestSessionId;

    if (!hasUserAccess && !hasGuestAccess) {
      return errorResponse(res, {
        code: "LINK_NOT_FOUND",
        message: "Link not found",
        statusCode: 404,
      });
    }

    // Verificar si el link tiene contraseña
    if (!link.password) {
      return errorResponse(res, {
        code: "LINK_NO_PASSWORD",
        message: "This link is not password protected",
        statusCode: 400,
      });
    }

    // Validar contraseña
    const isValidPassword = await bcryptjs.compare(password, link.password);

    if (!isValidPassword) {
      return errorResponse(res, {
        code: "INVALID_PASSWORD",
        message: "Invalid password",
        statusCode: 401,
      });
    }

    // Si la contraseña es correcta, devolver info del link
    return successResponse(res, {
      shortUrl: link.shortUrl,
      longUrl: link.longUrl,
      metadataTitle: link.metadataTitle,
      metadataDescription: link.metadataDescription,
      metadataImage: link.metadataImage,
      mobileUrl: link.mobileUrl,
      desktopUrl: link.desktopUrl,
      createdAt: link.createdAt,
      accessCount: link.accessCount,
      // No devolver datos sensibles como password hash
    });
  } catch (error) {
    return errorResponse(res, {
      code: "PASSWORD_VALIDATION_ERROR",
      message: "Error validating password",
      statusCode: 500,
    });
  }
};

// 5. Update link
const updateLink = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;
  const guest = req.guest;
  const isGuest = !!guest;
  const limits = isGuest ? planLimits.guest : planLimits.user;

  const {
    longUrl,
    password,
    accessLimit,
    blockedCountries,
    mobileUrl,
    desktopUrl,
    sufix,
    expirationDate,
    metadataTitle,
    metadataDescription,
    metadataImage,
  } = req.body;

  const validatedData = updateLinkSchema.safeParse(req.body);

  if (!validatedData.success) {
    const issues = validatedData.error.issues.map((issue) => ({
      field: issue.path[0],
      message: issue.message,
    }));

    return errorResponse(
      res,
      {
        code: "INVALID_DATA",
        message: "Invalid data",
        statusCode: 400,
      },
      issues
    );
  }

  try {
    const existingLink = await prisma.link.findUnique({
      where: { shortUrl },
    });

    if (!existingLink) {
      return errorResponse(res, {
        code: "LINK_NOT_FOUND",
        message: "Link not found",
        statusCode: 404,
      });
    }

    const hasUserAccess = user && existingLink.userId === user.id;
    const hasGuestAccess =
      guest && existingLink.guestSessionId === guest.guestSessionId;

    if (!hasUserAccess && !hasGuestAccess) {
      return errorResponse(res, {
        code: "LINK_NOT_FOUND",
        message: "Link not found",
        statusCode: 404,
      });
    }

    const updateData = {};
    if (longUrl !== undefined) updateData.longUrl = longUrl;
    if (metadataTitle !== undefined && limits.metadata)
      updateData.metadataTitle = metadataTitle;
    if (metadataDescription !== undefined && limits.metadata)
      updateData.metadataDescription = metadataDescription;
    if (metadataImage !== undefined && limits.metadata)
      updateData.metadataImage = metadataImage;
    if (password !== undefined && limits.password) {
      updateData.password = password ? await bcryptjs.hash(password, 10) : null;
    }
    if (accessLimit !== undefined && limits.accessLimit)
      updateData.accessLimit = accessLimit;
    if (mobileUrl !== undefined && limits.smartRedirection)
      updateData.mobileUrl = mobileUrl;
    if (desktopUrl !== undefined && limits.smartRedirection)
      updateData.desktopUrl = desktopUrl;
    if (sufix !== undefined && limits.sufix) {
      if (sufix) {
        const existingSufix = await prisma.link.findFirst({
          where: {
            sufix: sufix.toLowerCase(),
          },
        });

        if (existingSufix) {
          return errorResponse(res, {
            code: "SUFIX_ALREADY_EXISTS",
            message: "This custom URL is already taken",
            statusCode: 400,
          });
        }
        updateData.sufix = sufix.toLowerCase();
      }
    }
    if (expirationDate !== undefined && limits.expirationDate)
      updateData.dateExpire = expirationDate;
    if (blockedCountries !== undefined && limits.blockedCountries)
      updateData.blockedCountries = blockedCountries;

    const updatedLink = await prisma.link.update({
      where: { shortUrl },
      data: updateData,
    });

    return successResponse(res, updatedLink);
  } catch (error) {
    return errorResponse(res, {
      code: "LINK_UPDATE_ERROR",
      message: "Error updating link",
      statusCode: 500,
    });
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
      return errorResponse(res, {
        code: "LINK_NOT_FOUND",
        message: "Link not found",
        statusCode: 404,
      });
    }

    const hasUserAccess = user && existingLink.userId === user.id;
    const hasGuestAccess =
      guest && existingLink.guestSessionId === guest.guestSessionId;

    if (!hasUserAccess && !hasGuestAccess) {
      return errorResponse(res, {
        code: "LINK_NOT_FOUND",
        message: "Link not found",
        statusCode: 404,
      });
    }

    const deletedLink = await prisma.link.delete({
      where: { shortUrl },
    });

    return successResponse(res, deletedLink);
  } catch (error) {
    return errorResponse(res, {
      code: "LINK_DELETE_ERROR",
      message: "Error deleting link",
      statusCode: 500,
    });
  }
};

const generateShortCode = async () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let shortCode;
  let isUnique = false;

  while (!isUnique) {
    shortCode = "";
    for (let i = 0; i < 6; i++) {
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

module.exports = {
  createLink,
  getLink,
  getAllLinks,
  validateLinkPassword,
  updateLink,
  deleteLink,
};
