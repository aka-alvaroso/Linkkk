const prisma = require("../prisma/client");
const { createLinkSchema, updateLinkSchema } = require("../validators/link");
const bcryptjs = require("bcryptjs");

const planLimits = require("../utils/limits");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

// 1. Create link
const createLink = async (req, res) => {
  const user = req.user;
  const guest = req.guest;
  const isGuest = !!guest;
  const limits = isGuest ? planLimits.guest : planLimits.user;

  const {
    longUrl,
    status,
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

    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

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
        dateExpire: { lt: new Date() },
      },
    });

    if (count >= limits.links) {
      return errorResponse(res, ERRORS.LINK_LIMIT_EXCEEDED);
    }
  }

  const data = {};
  if (longUrl !== undefined) data.longUrl = longUrl;
  if (status !== undefined && limits.status) data.status = status;
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
        return errorResponse(res, ERRORS.SHORT_URL_EXISTS);
      }
      data.sufix = sufix.toLowerCase();
    }
  }
  if (expirationDate !== undefined) data.dateExpire = expirationDate;
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
      ...link,
      password: link.password !== null ? true : false,
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
        ...link,
        password: link.password !== null ? true : false,
      }))
    );
  } catch (error) {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
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
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    const hasUserAccess = user && link.userId === user.id;
    const hasGuestAccess =
      guest && link.guestSessionId === guest.guestSessionId;

    if (!hasUserAccess && !hasGuestAccess) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    // Verificar si el link tiene contraseña
    if (!link.password) {
      return errorResponse(res, ERRORS.LINK_NO_PASSWORD);
    }

    // Validar contraseña
    const isValidPassword = await bcryptjs.compare(password, link.password);

    if (!isValidPassword) {
      return errorResponse(res, ERRORS.INVALID_CREDENTIALS);
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
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 5. Update link
const updateLink = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;
  const guest = req.guest;
  const isGuest = !!guest;
  const limits = isGuest ? planLimits.guest : planLimits.user;

  const data = req.body;

  // console.log(data);

  const validatedData = updateLinkSchema.safeParse(data);

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
    if (data.longUrl !== undefined) updateData.longUrl = data.longUrl;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.metadataTitle !== undefined && limits.metadata)
      updateData.metadataTitle = data.metadataTitle;
    if (data.metadataDescription !== undefined && limits.metadata)
      updateData.metadataDescription = data.metadataDescription;
    if (data.metadataImage !== undefined && limits.metadata)
      updateData.metadataImage = data.metadataImage;
    if (data.password !== undefined && limits.password) {
      updateData.password = data.password
        ? await bcryptjs.hash(data.password, 10)
        : null;
    }
    if (data.accessLimit !== undefined && limits.accessLimit)
      updateData.accessLimit = data.accessLimit;
    if (data.mobileUrl !== undefined && limits.smartRedirection)
      updateData.mobileUrl = data.mobileUrl;
    if (data.desktopUrl !== undefined && limits.smartRedirection)
      updateData.desktopUrl = data.desktopUrl;
    if (data.sufix !== undefined && limits.sufix) {
      if (data.sufix) {
        const existingSufix = await prisma.link.findFirst({
          where: {
            sufix: data.sufix.toLowerCase(),
            id: {
              not: existingLink.id,
            },
          },
        });

        if (existingSufix) {
          return errorResponse(res, ERRORS.SHORT_URL_EXISTS);
        }
        updateData.sufix = data.sufix.toLowerCase();
      }
    }
    if (data.expirationDate !== undefined)
      updateData.dateExpire = data.expirationDate;
    if (data.blockedCountries !== undefined && limits.blockedCountries)
      updateData.blockedCountries = data.blockedCountries;

    const updatedLink = await prisma.link.update({
      where: { shortUrl },
      data: updateData,
    });

    return successResponse(res, updatedLink);
  } catch (error) {
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

module.exports = {
  createLink,
  getLink,
  getAllLinks,
  validateLinkPassword,
  updateLink,
  deleteLink,
};
