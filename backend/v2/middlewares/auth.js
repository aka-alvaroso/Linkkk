const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const AUTH_SECRET_KEY = process.env.V2_AUTH_SECRET_KEY;
const GUEST_SECRET_KEY = process.env.V2_GUEST_SECRET_KEY;
const { errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

// Must be authenticated as user or guest
const auth = async (req, res, next) => {
  let token = req.cookies.token;
  let guestToken = req.cookies.guestToken;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ") && authHeader.length > 7) {
      token = authHeader.substring(7);
    }
  }

  if (!guestToken && req.headers["guest-token"]) {
    const guestHeader = req.headers["guest-token"];
    if (guestHeader.startsWith("Bearer ") && guestHeader.length > 7) {
      guestToken = guestHeader.substring(7);
    }
  }

  if (token) {
    try {
      const userDecoded = jwt.verify(token, AUTH_SECRET_KEY);

      // Fetch full user data from database
      const user = await prisma.user.findUnique({
        where: { id: userDecoded.id },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      });

      req.user = user;
    } catch (error) {}
  }

  if (guestToken) {
    try {
      const guestDecoded = jwt.verify(guestToken, GUEST_SECRET_KEY);
      req.guest = guestDecoded;
    } catch (error) {}
  }

  if (!req.user && !req.guest) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  next();
};

// Must be authenticated as user
const authUser = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!existingUser) {
      return errorResponse(res, ERRORS.USER_NOT_FOUND);
    }
  } catch (error) {
    return errorResponse(res, ERRORS.DATABASE_ERROR);
  }

  next();
};

// Must be authenticated as guest
const authGuest = async (req, res, next) => {
  const guest = req.guest;

  if (!guest) {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  try {
    const existingGuest = await prisma.guestSession.findUnique({
      where: {
        id: guest.guestSessionId,
      },
    });

    if (!existingGuest) {
      return errorResponse(res, ERRORS.GUEST_SESSION_NOT_FOUND);
    }
  } catch (error) {
    return errorResponse(res, ERRORS.DATABASE_ERROR);
  }

  next();
};

// Can be authenticated as guest
const optionalGuest = async (req, res, next) => {
  let guestToken = req.cookies.guestToken;

  if (guestToken) {
    try {
      const guestDecoded = jwt.verify(guestToken, GUEST_SECRET_KEY);
      req.guest = guestDecoded;
    } catch (error) {
      req.guest = null;
    }
  }

  next();
};

// Can be authenticated as user or guest
const optionalAuth = async (req, res, next) => {
  let token = req.cookies.token;
  let guestToken = req.cookies.guestToken;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ") && authHeader.length > 7) {
      token = authHeader.substring(7);
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, AUTH_SECRET_KEY);

      // Fetch full user data from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      });

      req.user = user;
    } catch (error) {
      req.user = null;
    }
  }

  if (guestToken) {
    try {
      const guestDecoded = jwt.verify(guestToken, GUEST_SECRET_KEY);
      req.guest = guestDecoded;
    } catch (error) {
      req.guest = null;
    }
  }

  next();
};

module.exports = {
  auth,
  authUser,
  authGuest,
  optionalGuest,
  optionalAuth,
};
