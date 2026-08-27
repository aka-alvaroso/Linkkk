const prisma = require("../prisma/client");
const { linkMetadataSchema } = require("../validators/linkMetadata");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
const logger = require("../utils/logger");
const {
  uploadMetadataImage: uploadMetadataImageToCloudinary,
  deleteLogo,
} = require("../services/cloudinary");

const DEFAULT_METADATA = {
  ogTitle: null,
  ogDescription: null,
  ogImageUrl: null,
  enabled: true,
};

// Get link metadata
const getLinkMetadata = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;

  if (!user) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  try {
    const link = await prisma.link.findUnique({
      where: { shortUrl },
      include: { metadata: true },
    });

    if (!link) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    if (link.userId !== user.id) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    const metadata = link.metadata || DEFAULT_METADATA;

    return successResponse(res, {
      shortUrl: link.shortUrl,
      metadata: {
        ogTitle: metadata.ogTitle,
        ogDescription: metadata.ogDescription,
        ogImageUrl: metadata.ogImageUrl,
        enabled: metadata.enabled,
      },
    });
  } catch (error) {
    logger.error("Error fetching link metadata", {
      shortUrl,
      error: error.message,
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// Create or update link metadata
const updateLinkMetadata = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;

  if (!user) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  const validated = linkMetadataSchema.safeParse(req.body);
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

    if (link.userId !== user.id) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    const metadata = await prisma.linkMetadata.upsert({
      where: { linkId: link.id },
      update: validated.data,
      create: {
        linkId: link.id,
        ...validated.data,
      },
    });

    return successResponse(res, {
      shortUrl: link.shortUrl,
      metadata: {
        ogTitle: metadata.ogTitle,
        ogDescription: metadata.ogDescription,
        ogImageUrl: metadata.ogImageUrl,
        enabled: metadata.enabled,
      },
    });
  } catch (error) {
    logger.error("Error updating link metadata", {
      shortUrl,
      error: error.message,
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// Upload OG image for a link
const uploadMetadataImage = async (req, res) => {
  const { shortUrl } = req.params;
  const user = req.user;

  if (!user) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  try {
    const link = await prisma.link.findUnique({
      where: { shortUrl },
    });

    if (!link) {
      return errorResponse(res, ERRORS.LINK_NOT_FOUND);
    }

    if (link.userId !== user.id) {
      return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
    }

    const result = await uploadMetadataImageToCloudinary(
      req.file.buffer,
      user.id.toString(),
      shortUrl
    );

    logger.info("Metadata image uploaded successfully", {
      userId: user.id,
      shortUrl,
      ogImageUrl: result.url,
    });

    return successResponse(res, {
      ogImageUrl: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    logger.error("Error uploading metadata image", {
      shortUrl,
      userId: user.id,
      error: error.message,
    });
    return errorResponse(res, ERRORS.UPLOAD_FAILED);
  }
};

// Delete an OG image from Cloudinary
const deleteMetadataImage = async (req, res) => {
  const { publicId } = req.body;
  const user = req.user;

  if (!user) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  if (!publicId) {
    return errorResponse(res, ERRORS.INVALID_DATA, [
      { field: "publicId", message: "Public ID is required" },
    ]);
  }

  // SECURITY: Validate ownership - publicId must belong to this user's folder
  // Format: linkkk/metadata-images/{userId}/meta_xxx
  const expectedPrefix = `linkkk/metadata-images/${user.id}/`;
  if (!publicId.startsWith(expectedPrefix)) {
    logger.warn("Attempted to delete metadata image from another user", {
      userId: user.id,
      publicId,
      expectedPrefix,
    });
    return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
  }

  try {
    await deleteLogo(publicId);

    logger.info("Metadata image deleted successfully", {
      userId: user.id,
      publicId,
    });

    return successResponse(res, { success: true });
  } catch (error) {
    logger.error("Error deleting metadata image", {
      userId: user.id,
      publicId,
      error: error.message,
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

module.exports = {
  getLinkMetadata,
  updateLinkMetadata,
  uploadMetadataImage,
  deleteMetadataImage,
};
