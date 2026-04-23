const prisma = require("../prisma/client");
const { createGroupSchema, updateGroupSchema } = require("../validators/group");
const { getLimitsForUser } = require("../utils/limits");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

// 1. Get all groups for the authenticated user
const getGroups = async (req, res) => {
  const user = req.user;

  try {
    const groups = await prisma.group.findMany({
      where: { userId: user.id },
      include: { _count: { select: { links: true } } },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    return successResponse(res, groups);
  } catch (error) {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 2. Get a single group with its links
const getGroup = async (req, res) => {
  const user = req.user;
  const groupId = parseInt(req.params.groupId, 10);

  if (isNaN(groupId)) return errorResponse(res, ERRORS.GROUP_NOT_FOUND);

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      links: {
        include: { tags: { include: { tag: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!group) return errorResponse(res, ERRORS.GROUP_NOT_FOUND);
  if (group.userId !== user.id) return errorResponse(res, ERRORS.GROUP_ACCESS_DENIED);

  return successResponse(res, group);
};

// 3. Create a group
const createGroup = async (req, res) => {
  const user = req.user;
  const limits = getLimitsForUser(user, null);

  if (limits.groups === 0) {
    return errorResponse(res, ERRORS.GROUPS_NOT_AVAILABLE);
  }

  const validate = createGroupSchema.safeParse(req.body);
  if (!validate.success) {
    const issues = validate.error.issues.map((i) => ({ field: i.path[0], message: i.message }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  const { name, description, color } = validate.data;

  if (limits.groups !== null) {
    const count = await prisma.group.count({ where: { userId: user.id } });
    if (count >= limits.groups) {
      return errorResponse(res, ERRORS.GROUP_LIMIT_EXCEEDED);
    }
  }

  try {
    const group = await prisma.group.create({
      data: { userId: user.id, name, description, color },
    });
    return successResponse(res, group, 201);
  } catch (error) {
    if (error.code === "P2002") {
      return errorResponse(res, ERRORS.GROUP_NAME_EXISTS);
    }
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 4. Update a group
const updateGroup = async (req, res) => {
  const user = req.user;
  const groupId = parseInt(req.params.groupId, 10);

  if (isNaN(groupId)) return errorResponse(res, ERRORS.GROUP_NOT_FOUND);

  const validate = updateGroupSchema.safeParse(req.body);
  if (!validate.success) {
    const issues = validate.error.issues.map((i) => ({ field: i.path[0], message: i.message }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return errorResponse(res, ERRORS.GROUP_NOT_FOUND);
  if (group.userId !== user.id) return errorResponse(res, ERRORS.GROUP_ACCESS_DENIED);

  try {
    const updated = await prisma.group.update({
      where: { id: groupId },
      data: validate.data,
    });
    return successResponse(res, updated);
  } catch (error) {
    if (error.code === "P2002") {
      return errorResponse(res, ERRORS.GROUP_NAME_EXISTS);
    }
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// 5. Delete a group (links become ungrouped via SetNull)
const deleteGroup = async (req, res) => {
  const user = req.user;
  const groupId = parseInt(req.params.groupId, 10);

  if (isNaN(groupId)) return errorResponse(res, ERRORS.GROUP_NOT_FOUND);

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return errorResponse(res, ERRORS.GROUP_NOT_FOUND);
  if (group.userId !== user.id) return errorResponse(res, ERRORS.GROUP_ACCESS_DENIED);

  await prisma.group.delete({ where: { id: groupId } });
  return successResponse(res, { deleted: true });
};

// 6. Move a link into a group (or ungroup it by passing groupId: null)
const moveLinkToGroup = async (req, res) => {
  const user = req.user;
  const groupId = parseInt(req.params.groupId, 10);
  const linkId = parseInt(req.params.linkId, 10);

  if (isNaN(groupId)) return errorResponse(res, ERRORS.GROUP_NOT_FOUND);
  if (isNaN(linkId)) return errorResponse(res, ERRORS.LINK_NOT_FOUND);

  const [group, link] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    prisma.link.findUnique({ where: { id: linkId } }),
  ]);

  if (!group) return errorResponse(res, ERRORS.GROUP_NOT_FOUND);
  if (group.userId !== user.id) return errorResponse(res, ERRORS.GROUP_ACCESS_DENIED);
  if (!link) return errorResponse(res, ERRORS.LINK_NOT_FOUND);
  if (link.userId !== user.id) return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);

  const updated = await prisma.link.update({
    where: { id: linkId },
    data: { groupId },
    include: { tags: { include: { tag: true } } },
  });

  return successResponse(res, updated);
};

// 7. Remove a link from a group
const removeLinkFromGroup = async (req, res) => {
  const user = req.user;
  const groupId = parseInt(req.params.groupId, 10);
  const linkId = parseInt(req.params.linkId, 10);

  if (isNaN(groupId)) return errorResponse(res, ERRORS.GROUP_NOT_FOUND);
  if (isNaN(linkId)) return errorResponse(res, ERRORS.LINK_NOT_FOUND);

  const [group, link] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    prisma.link.findUnique({ where: { id: linkId } }),
  ]);

  if (!group) return errorResponse(res, ERRORS.GROUP_NOT_FOUND);
  if (group.userId !== user.id) return errorResponse(res, ERRORS.GROUP_ACCESS_DENIED);
  if (!link) return errorResponse(res, ERRORS.LINK_NOT_FOUND);
  if (link.userId !== user.id) return errorResponse(res, ERRORS.LINK_ACCESS_DENIED);
  if (link.groupId !== groupId) return errorResponse(res, ERRORS.LINK_NOT_FOUND);

  const updated = await prisma.link.update({
    where: { id: linkId },
    data: { groupId: null },
  });

  return successResponse(res, updated);
};

module.exports = {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  moveLinkToGroup,
  removeLinkFromGroup,
};
