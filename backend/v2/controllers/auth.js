const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const bcryptjs = require("bcryptjs");

const GUEST_SECRET_KEY = process.env.V2_GUEST_SECRET_KEY;
const ENV = process.env.ENV;

const { successResponse, errorResponse } = require("../utils/response");
const { registerSchema, loginSchema } = require("../validators/auth");

const validateSession = (req, res) => {
  const user = req.user;
  const guest = req.guest;

  if (!user && !guest) {
    return errorResponse(res, {
      code: "UNAUTHORIZED",
      message: "Unauthorized",
      statusCode: 401,
    });
  }

  return successResponse(res, {
    user,
    guest,
  });
};

const createGuestSession = async (req, res) => {
  try {
    const guestSession = await prisma.guestSession.create({
      data: {
        createdAt: new Date(),
      },
    });

    const token = jwt.sign(
      {
        guestSessionId: guestSession.id,
      },
      GUEST_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("guestToken", token, {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      secure: process.env.ENV === "production",
      sameSite: "strict",
    });

    if (ENV === "development") {
      console.log("Guest token: ", token);
    }
    return successResponse(res, {
      guestSession,
    });
  } catch (error) {
    return errorResponse(res, {
      code: "GUEST_CREATE_ERROR",
      message: "Error creating guest session",
      statusCode: 500,
    });
  }
};

const register = async (req, res) => {
  try {
    const guest = req.guest;
    const { username, email, password } = req.body;

    const validate = registerSchema.safeParse(req.body);
    if (!validate.success) {
      return errorResponse(res, {
        code: "REGISTER_INVALID_DATA",
        message: "Invalid register data",
        statusCode: 400,
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return errorResponse(res, {
        code: "REGISTER_USER_EXISTS",
        message: "User already exists",
        statusCode: 400,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        planId: 1,
      },
    });

    await deleteGuestSession(guest.guestSessionId);

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
    return errorResponse(res, {
      code: "REGISTER_ERROR",
      message: "Error registering user",
      statusCode: 500,
    });
  }
};

const login = async (req, res) => {
  try {
    const guest = req.guest;
    const { usernameOrEmail, password } = req.body;

    const validate = loginSchema.safeParse(req.body);
    if (!validate.success) {
      return errorResponse(res, {
        code: "LOGIN_INVALID_DATA",
        message: "Invalid login data",
        statusCode: 400,
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) {
      return errorResponse(res, {
        code: "LOGIN_INVALID_CREDENTIALS",
        message: "Invalid credentials",
        statusCode: 401,
      });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return errorResponse(res, {
        code: "LOGIN_INVALID_CREDENTIALS",
        message: "Invalid credentials",
        statusCode: 401,
      });
    }

    await transferLinks(guest.guestSessionId, user.id);

    await deleteGuestSession(guest.guestSessionId);

    const token = jwt.sign({ id: user.id }, process.env.V2_AUTH_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.ENV === "production",
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
    return errorResponse(res, {
      code: "LOGIN_ERROR",
      message: "Error logging in",
      statusCode: 500,
    });
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
        guest_sessionId: guestSessionId,
      },
      data: {
        userId: userId,
        guest_sessionId: null,
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
