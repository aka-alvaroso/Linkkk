const prisma = require("../prisma/client");
const { createTagSchema, updateTagSchema } = require("../validators/tag");
const { getLimitsForUser } = require("../utils/limits");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

// 1. Get all tags for the authenticated user
const getTags = async (req, res) => {
  const user = req.user;

  try {
    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      include: { _count: { select: { links: true } } },
      orderBy: { name: "asc" },
    });

    return successResponse(res, tags);
  } catch (error) {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 2. Create a tag
const createTag = async (req, res) => {
  const user = req.user;
  const limits = getLimitsForUser(user, null);

  if (limits.tags === 0) {
    return errorResponse(res, ERRORS.TAGS_NOT_AVAILABLE);
  }

  const validate = createTagSchema.safeParse(req.body);
  if (!validate.success) {
    const issues = validate.error.issues.map((i) => ({ field: i.path[0], message: i.message }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  const { name, color } = validate.data;

  if (limits.tags !== null) {
    const count = await prisma.tag.count({ where: { userId: user.id } });
    if (count >= limits.tags) {
      return errorResponse(res, ERRORS.TAG_LIMIT_EXCEEDED);
    }
  }

  try {
    const tag = await prisma.tag.create({
      data: { userId: user.id, name, color },
    });
    return successResponse(res, tag, 201);
  } catch (error) {
    if (error.code === "P2002") {
      return errorResponse(res, ERRORS.TAG_NAME_EXISTS);
    }
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 3. Update a tag
const updateTag = async (req, res) => {
  const user = req.user;
  const tagId = parseInt(req.params.tagId, 10);

  if (isNaN(tagId)) return errorResponse(res, ERRORS.TAG_NOT_FOUND);

  const validate = updateTagSchema.safeParse(req.body);
  if (!validate.success) {
    const issues = validate.error.issues.map((i) => ({ field: i.path[0], message: i.message }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) return errorResponse(res, ERRORS.TAG_NOT_FOUND);
  if (tag.userId !== user.id) return errorResponse(res, ERRORS.TAG_ACCESS_DENIED);

  try {
    const updated = await prisma.tag.update({
      where: { id: tagId },
      data: validate.data,
    });
    return successResponse(res, updated);
  } catch (error) {
    if (error.code === "P2002") {
      return errorResponse(res, ERRORS.TAG_NAME_EXISTS);
    }
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 4. Delete a tag
const deleteTag = async (req, res) => {
  const user = req.user;
  const tagId = parseInt(req.params.tagId, 10);

  if (isNaN(tagId)) return errorResponse(res, ERRORS.TAG_NOT_FOUND);

  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) return errorResponse(res, ERRORS.TAG_NOT_FOUND);
  if (tag.userId !== user.id) return errorResponse(res, ERRORS.TAG_ACCESS_DENIED);

  await prisma.tag.delete({ where: { id: tagId } });
  return successResponse(res, { deleted: true });
};

// 5. Assign tags to a link (replaces all existing tags on the link)
const assignTagsToLink = async (req, res) => {
  const user = req.user;
  const limits = getLimitsForUser(user, null);
  const linkId = parseInt(req.params.linkId, 10);

  if (isNaN(linkId)) return errorResponse(res, ERRORS.LINK_NOT_FOUND);

  const { tagIds } = req.body;
  if (!Array.isArray(tagIds)) {
    return errorResponse(res, ERRORS.INVALID_DATA, [{ field: "tagIds", message: "tagIds must be an array" }]);
  }

  // Enforce tagsPerLink limit
  if (limits.tagsPerLink !== null && tagIds.length > limits.tagsPerLink) {
    return errorResponse(res, ERRORS.TAGS_PER_LINK_EXCEEDED);
  }

  const link = await prisma.link.findUnique({ where: { id: linkId } });
  if (!link) return errorResponse(res, ERRORS.LINK_NOT_FOUND);
  if (link.userId !== user.id) return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);

  if (tagIds.length > 0) {
    // Verify all tags belong to the user
    const tags = await prisma.tag.findMany({
      where: { id: { in: tagIds }, userId: user.id },
    });
    if (tags.length !== tagIds.length) {
      return errorResponse(res, ERRORS.TAG_NOT_FOUND);
    }
  }

  // Replace all tags atomically
  await prisma.$transaction([
    prisma.linkTag.deleteMany({ where: { linkId } }),
    ...(tagIds.length > 0
      ? [prisma.linkTag.createMany({ data: tagIds.map((tagId) => ({ linkId, tagId })) })]
      : []),
  ]);

  const updatedLink = await prisma.link.findUnique({
    where: { id: linkId },
    include: { tags: { include: { tag: true } } },
  });

  return successResponse(res, updatedLink);
};

module.exports = { getTags, createTag, updateTag, deleteTag, assignTagsToLink };
