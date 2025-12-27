const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const { errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
// SECURITY: JWT secret rotation support
const { verifyWithRotation } = require("../utils/jwtSecrets");
const logger = require("../utils/logger");
const config = require("../config/environment");

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
      // SECURITY: Use rotation-aware verification
      const userDecoded = verifyWithRotation(token, jwt, 'auth', {
        algorithms: ["HS256"],
        issuer: "linkkk-api",
        audience: "linkkk-users",
      });

      // Fetch full user data from database
      const user = await prisma.user.findUnique({
        where: { id: userDecoded.id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      req.user = user;
    } catch (error) {
      // Token invalid or expired - log but don't throw
      // We check req.user later, so just leave it undefined
      if (
        config.env.isDevelopment &&
        !config.env.isTest
      ) {
        logger.debug("User token validation failed", { error: error.message });
      }
    }
  }

  if (guestToken) {
    try {
      // SECURITY: Use rotation-aware verification
      const guestDecoded = verifyWithRotation(guestToken, jwt, 'guest', {
        algorithms: ["HS256"],
        issuer: "linkkk-api",
        audience: "linkkk-guests",
      });
      req.guest = guestDecoded;
    } catch (error) {
      // Guest token invalid or expired - log but don't throw
      if (
        config.env.isDevelopment &&
        !config.env.isTest
      ) {
        logger.debug("Guest token validation failed", { error: error.message });
      }
    }
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
      // SECURITY: Use rotation-aware verification
      const guestDecoded = verifyWithRotation(guestToken, jwt, 'guest', {
        algorithms: ["HS256"],
        issuer: "linkkk-api",
        audience: "linkkk-guests",
      });
      req.guest = guestDecoded;
    } catch (error) {
      // Optional guest auth - token validation failed but that's ok
      req.guest = null;
      if (
        config.env.isDevelopment &&
        !config.env.isTest
      ) {
        logger.debug("Optional guest token validation failed", {
          error: error.message,
        });
      }
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
      const decoded = jwt.verify(token, config.security.jwt.authSecret, {
        algorithms: ["HS256"],
        issuer: "linkkk-api",
        audience: "linkkk-users",
      });

      // Fetch full user data from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      req.user = user;
    } catch (error) {
      // Optional auth - token validation failed but that's ok
      req.user = null;
      if (
        config.env.isDevelopment &&
        !config.env.isTest
      ) {
        logger.debug("Optional user token validation failed", { error: error.message });
      }
    }
  }

  if (guestToken) {
    try {
      // SECURITY: Use rotation-aware verification
      const guestDecoded = verifyWithRotation(guestToken, jwt, 'guest', {
        algorithms: ["HS256"],
        issuer: "linkkk-api",
        audience: "linkkk-guests",
      });
      req.guest = guestDecoded;
    } catch (error) {
      // Optional auth - guest token validation failed but that's ok
      req.guest = null;
      if (
        config.env.isDevelopment &&
        !config.env.isTest
      ) {
        logger.debug("Optional guest token validation failed", { error: error.message });
      }
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
