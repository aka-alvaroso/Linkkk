const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const bcryptjs = require("bcryptjs");

const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
const { registerSchema, loginSchema } = require("../validators/auth");
const config = require("../config/environment");

const validateSession = (req, res) => {
  const user = req.user;
  const guest = req.guest;

  if (user) {
    return successResponse(res, {
      user,
    });
  } else if (guest) {
    return successResponse(res, {
      guest,
    });
  } else {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }
};

const createGuestSession = async (req, res) => {
  if (req.cookies.guestToken) {
    return errorResponse(res, ERRORS.GUEST_SESSION_EXISTS);
  }

  try {
    const guestSession = await prisma.guestSession.create({
      data: {
        createdAt: new Date(),
      },
    });

    const token = jwt.sign(
      { guestSessionId: guestSession.id },
      process.env.V2_GUEST_SECRET_KEY,
      {
        expiresIn: "1h",
        algorithm: "HS256",
        issuer: "linkkk-api",
        audience: "linkkk-guests",
      }
    );

    res.cookie("guestToken", token, {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: "strict",
    });
    return successResponse(
      res,
      {
        guestSession,
      },
      201
    );
  } catch (error) {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const register = async (req, res) => {
  try {
    const guest = req.guest;
    const { username, email, password } = req.body;

    const validate = registerSchema.safeParse(req.body);
    if (!validate.success) {
      const issues = validate.error.issues.map((issue) => {
        return {
          field: issue.path[0],
          message: issue.message,
        };
      });

      return errorResponse(res, ERRORS.INVALID_DATA, issues);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return errorResponse(res, ERRORS.USER_EXISTS);
    }

    // SECURITY: Use bcrypt with 12 rounds (OWASP recommendation)
    const hashedPassword = await bcryptjs.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Transferir links y limpiar sesión guest si existe
    if (guest && guest.guestSessionId) {
      await transferLinks(guest.guestSessionId, user.id);
      await deleteGuestSession(guest.guestSessionId);

      res.clearCookie("guestToken", {
        httpOnly: true,
        secure: config.env.isProduction,
        sameSite: "strict",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.V2_AUTH_SECRET_KEY, {
      expiresIn: "7d",
      algorithm: "HS256",
      issuer: "linkkk-api",
      audience: "linkkk-users",
    });

    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: "strict",
    });

    return successResponse(
      res,
      {
        user: {
          username,
          email,
        },
      },
      201
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const login = async (req, res) => {
  try {
    const guest = req.guest;
    const { usernameOrEmail, password } = req.body;

    const validate = loginSchema.safeParse(req.body);
    if (!validate.success) {
      return errorResponse(res, ERRORS.INVALID_DATA);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) {
      return errorResponse(res, ERRORS.INVALID_CREDENTIALS);
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return errorResponse(res, ERRORS.INVALID_CREDENTIALS);
    }

    // Transferir links y limpiar sesión guest si existe
    if (guest && guest.guestSessionId) {
      await transferLinks(guest.guestSessionId, user.id);
      await deleteGuestSession(guest.guestSessionId);

      res.clearCookie("guestToken", {
        httpOnly: true,
        secure: config.env.isProduction,
        sameSite: "strict",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.V2_AUTH_SECRET_KEY, {
      expiresIn: "7d",
      algorithm: "HS256",
      issuer: "linkkk-api",
      audience: "linkkk-users",
    });

    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: "strict",
    });

    return successResponse(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        planId: user.planId,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const logout = (req, res) => {
  // Clear both cookies
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("guestToken", {
    httpOnly: true,
    secure: process.env.ENV === "production",
    sameSite: "strict",
  });

  return successResponse(res, {
    message: "Logged out successfully",
  });
};

const transferLinks = async (guestSessionId, userId) => {
  try {
    await prisma.link.updateMany({
      where: {
        guestSessionId: guestSessionId,
      },
      data: {
        userId: userId,
        guestSessionId: null,
      },
    });
  } catch (error) {
    console.error("Error transferring guest links:", error);
  }
};

const deleteGuestSession = async (id) => {
  try {
    await prisma.guestSession.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  validateSession,
  createGuestSession,
  register,
  login,
  logout,
};
