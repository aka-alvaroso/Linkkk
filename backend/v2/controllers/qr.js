const prisma = require("../prisma/client");
const QRCode = require("qrcode");
const { qrConfigSchema } = require("../validators/qr");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
const logger = require("../utils/logger");
const config = require("../config/environment");
const { uploadLogo, deleteLogo } = require("../services/cloudinary");

// Get QR config for a link
const getQRConfig = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;

  // Only authenticated users can access QR config (not guests)
  if (!user) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  try {
    const link = await prisma.link.findUnique({
      where: { shortUrl },
      include: { qrConfig: true },
    });

    if (!link) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    // Authorization check
    if (link.userId !== user.id) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    // Return config or defaults
    const qrConfig = link.qrConfig || {
      foregroundColor: "#000000",
      backgroundColor: "#FFFFFF",
      logoUrl: null,
      logoSize: 0.3,
      dotsStyle: "square",
      cornersStyle: "square",
    };

    return successResponse(res, {
      shortUrl: link.shortUrl,
      qrConfig: {
        foregroundColor: qrConfig.foregroundColor,
        backgroundColor: qrConfig.backgroundColor,
        logoUrl: qrConfig.logoUrl,
        logoSize: qrConfig.logoSize,
        dotsStyle: qrConfig.dotsStyle,
        cornersStyle: qrConfig.cornersStyle,
      },
    });
  } catch (error) {
    logger.error("Error fetching QR config", {
      shortUrl,
      error: error.message,
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// Create or update QR config for a link
const updateQRConfig = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;

  // Only authenticated users can update QR config (not guests)
  if (!user) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  // Validate input
  const validated = qrConfigSchema.safeParse(req.body);
  if (!validated.success) {
    const issues = validated.error.issues.map((issue) => ({
      field: issue.path[0],
      message: issue.message,
    }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  try {
    const link = await prisma.link.findUnique({
      where: { shortUrl },
    });

    if (!link) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    // Authorization check
    if (link.userId !== user.id) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    // Upsert QR config
    const qrConfig = await prisma.qRConfig.upsert({
      where: { linkId: link.id },
      update: validated.data,
      create: {
        linkId: link.id,
        ...validated.data,
      },
    });

    return successResponse(res, {
      shortUrl: link.shortUrl,
      qrConfig: {
        foregroundColor: qrConfig.foregroundColor,
        backgroundColor: qrConfig.backgroundColor,
        logoUrl: qrConfig.logoUrl,
        logoSize: qrConfig.logoSize,
        dotsStyle: qrConfig.dotsStyle,
        cornersStyle: qrConfig.cornersStyle,
      },
    });
  } catch (error) {
    logger.error("Error updating QR config", {
      shortUrl,
      error: error.message,
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// Upload logo for QR code
const uploadQRLogo = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;

  // Only authenticated users can upload logos
  if (!user) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  try {
    // Verify link exists and belongs to user
    const link = await prisma.link.findUnique({
      where: { shortUrl },
    });

    if (!link) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    if (link.userId !== user.id) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    // Upload to Cloudinary
    const result = await uploadLogo(
      req.file.buffer,
      user.id.toString(),
      shortUrl
    );

    logger.info("QR logo uploaded successfully", {
      userId: user.id,
      shortUrl,
      logoUrl: result.url,
    });

    return successResponse(res, {
      logoUrl: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    logger.error("Error uploading QR logo", {
      shortUrl,
      userId: user.id,
      error: error.message,
    });
    return errorResponse(res, ERRORS.UPLOAD_FAILED);
  }
};

// Delete logo from Cloudinary
const deleteQRLogo = async (req, res) => {
  const { publicId } = req.body;
  const user = req.user;

  // Only authenticated users can delete logos
  if (!user) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  if (!publicId) {
    return errorResponse(res, ERRORS.INVALID_DATA, [
      { field: "publicId", message: "Public ID is required" },
    ]);
  }

  // SECURITY: Validate ownership - publicId must belong to this user's folder
  // Format: linkkk/qr-logos/{userId}/logo_xxx
  const expectedPrefix = `linkkk/qr-logos/${user.id}/`;
  if (!publicId.startsWith(expectedPrefix)) {
    logger.warn("Attempted to delete logo from another user", {
      userId: user.id,
      publicId,
      expectedPrefix,
    });
    return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
  }

  try {
    // Delete from Cloudinary
    await deleteLogo(publicId);

    logger.info("QR logo deleted successfully", {
      userId: user.id,
      publicId,
    });

    return successResponse(res, { success: true });
  } catch (error) {
    logger.error("Error deleting QR logo", {
      userId: user.id,
      publicId,
      error: error.message,
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

module.exports = {
  getQRConfig,
  updateQRConfig,
  uploadQRLogo,
  deleteQRLogo,
};
