const prisma = require("../prisma/client");
const { updateUserSchema } = require("../validators/user");
const bcryptjs = require("bcryptjs");

const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

const updateUser = async (req, res) => {
  const user = req.user;
  const { email, username, password, avatarUrl, locale } = req.body;

  const validate = updateUserSchema.safeParse(req.body);

  if (!validate.success) {
    const issues = validate.error.issues.map((issue) => {
      return {
        field: issue.path[0],
        message: issue.message,
      };
    });

    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  try {
    // SECURITY: Explicitly build update object with only allowed fields (prevents Mass Assignment)
    const updateData = {};

    if (email !== undefined) updateData.email = validate.data.email;
    if (username !== undefined) updateData.username = validate.data.username;
    if (avatarUrl !== undefined) updateData.avatarUrl = validate.data.avatarUrl;
    if (locale !== undefined) updateData.locale = validate.data.locale;

    if (password !== undefined) {
      // SECURITY: Use bcrypt with 12 rounds (OWASP recommendation)
      updateData.password = await bcryptjs.hash(validate.data.password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        locale: true,
        createdAt: true,
        // Don't return password or apiKey
      },
    });

    return successResponse(res, updatedUser);
  } catch {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const deleteUserData = async (req, res) => {
  const user = req.user;

  try {
    // Delete all links associated with the user
    await prisma.link.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return res.status(200).json({
      success: true,
      data: {},
      message: "All user data deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const deleteUser = async (req, res) => {
  const user = req.user;

  try {
    // Delete all links first (if not using cascade delete)
    await prisma.link.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Delete the user
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    // Clear the authentication cookie
    res.clearCookie("token");

    return res.status(200).json({
      success: true,
      data: {},
      message: "User account deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

module.exports = {
  updateUser,
  deleteUserData,
  deleteUser,
};
