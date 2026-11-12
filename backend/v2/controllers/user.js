const prisma = require("../prisma/client");
const { updateUserSchema } = require("../validators/user");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/environment");
const { passwordChangeCutoff } = require("../utils/password");

const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

const updateUser = async (req, res) => {
  const user = req.user;
  const { email, username, password, currentPassword } = req.body;

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
    let passwordCutoff = null;

    // SECURITY: Explicitly build update object with only allowed fields (prevents Mass Assignment)
    const updateData = {};

    if (email !== undefined) updateData.email = validate.data.email;
    if (username !== undefined) updateData.username = validate.data.username;
    if (password !== undefined) {
      // SECURITY: changing the password requires knowing the current one, so
      // an unattended open session is not enough to take the account over.
      // Accounts created through OAuth have no password yet and may set one.
      const stored = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      if (stored?.password) {
        if (!currentPassword) {
          return errorResponse(res, ERRORS.CURRENT_PASSWORD_REQUIRED);
        }
        const matches = await bcryptjs.compare(currentPassword, stored.password);
        if (!matches) {
          return errorResponse(res, ERRORS.CURRENT_PASSWORD_INVALID);
        }
      }

      // SECURITY: Use bcrypt with 12 rounds (OWASP recommendation)
      updateData.password = await bcryptjs.hash(validate.data.password, 12);
      // Signs out every other session (see middlewares/auth.js)
      passwordCutoff = passwordChangeCutoff();
      updateData.passwordChangedAt = passwordCutoff.date;
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
        createdAt: true,
        // Don't return password or apiKey
      },
    });

    if (passwordCutoff) {
      // Keep this browser signed in: its old token is no longer accepted.
      // `iat` is set to the cut-off itself so the new token is not older than it.
      const token = jwt.sign({ id: user.id, iat: passwordCutoff.seconds }, config.security.jwt.authSecret, {
        expiresIn: config.security.jwt.authExpiresIn,
        algorithm: "HS256",
        issuer: "linkkk-api",
        audience: "linkkk-users",
      });

      res.cookie("token", token, {
        maxAge: config.security.cookies.authMaxAge,
        httpOnly: config.security.cookies.httpOnly,
        secure: config.security.cookies.secure,
        sameSite: config.security.cookies.sameSite,
      });
    }

    return successResponse(res, updatedUser);
  } catch (error) {
    if (error.code === "P2002") {
      if (error.meta.target.includes("username"))
        return errorResponse(res, ERRORS.USER_EXISTS);
      if (error.meta.target.includes("email"))
        return errorResponse(res, ERRORS.EMAIL_EXISTS);
    }
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
