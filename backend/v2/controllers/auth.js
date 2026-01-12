const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");

const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
const { registerSchema, loginSchema } = require("../validators/auth");
const config = require("../config/environment");
const telegramService = require("../services/telegramService");
const logger = require("../utils/logger");
const sentryService = require("../services/sentry");
const googleOAuthService = require("../services/googleOAuth");
const githubOAuthService = require("../services/githubOAuth");

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
      config.security.jwt.guestSecret,
      {
        expiresIn: config.security.jwt.guestExpiresIn,
        algorithm: "HS256",
        issuer: "linkkk-api",
        audience: "linkkk-guests",
      }
    );

    res.cookie("guestToken", token, {
      maxAge: config.security.cookies.guestMaxAge,
      httpOnly: config.security.cookies.httpOnly,
      secure: config.security.cookies.secure,
      sameSite: config.security.cookies.sameSite,
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
        httpOnly: config.security.cookies.httpOnly,
        secure: config.security.cookies.secure,
        sameSite: config.security.cookies.sameSite,
      });
    }

    const token = jwt.sign({ id: user.id }, config.security.jwt.authSecret, {
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

    // Log registration
    logger.info("User registered successfully", {
      type: "AUTH",
      userId: user.id,
      username,
      email,
    });

    // Notify Telegram (non-blocking)
    telegramService.notifyRegistration(email, username).catch(() => {});

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          username,
          email,
          role: user.role,
        },
      },
      201
    );
  } catch (error) {
    logger.error("Error during registration", {
      type: "AUTH",
      error: error.message,
      stack: error.stack,
    });
    sentryService.captureException(error, {
      tags: { type: "registration" },
    });
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
        httpOnly: config.security.cookies.httpOnly,
        secure: config.security.cookies.secure,
        sameSite: config.security.cookies.sameSite,
      });
    }

    const token = jwt.sign({ id: user.id }, config.security.jwt.authSecret, {
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

    // Log login
    logger.info("User logged in successfully", {
      type: "AUTH",
      userId: user.id,
      username: user.username,
      email: user.email,
      ip: req.ip,
    });

    // Notify Telegram (non-blocking)
    telegramService
      .notifyLogin(user.email, user.username, "Login normal")
      .catch(() => {});

    return successResponse(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Error during login", {
      type: "AUTH",
      error: error.message,
      stack: error.stack,
    });
    sentryService.captureException(error, {
      tags: { type: "login" },
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const logout = (req, res) => {
  // Clear both cookies
  res.clearCookie("token", {
    httpOnly: config.security.cookies.httpOnly,
    secure: config.security.cookies.secure,
    sameSite: config.security.cookies.sameSite,
  });

  res.clearCookie("guestToken", {
    httpOnly: config.security.cookies.httpOnly,
    secure: config.security.cookies.secure,
    sameSite: config.security.cookies.sameSite,
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

// Redirects user to Google's authorization page
const googleAuth = async (req, res) => {
  try {
    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString("hex");

    // Store state in cookie for verification in callback
    res.cookie("oauth_state", state, {
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true,
      secure: config.security.cookies.secure,
      sameSite: config.security.cookies.sameSite,
    });

    // Generate Google authorization URL
    const authUrl = googleOAuthService.getAuthorizationUrl(state);

    // Redirect to Google
    res.redirect(authUrl);
  } catch (error) {
    logger.error("Error initiating Google OAuth", {
      type: "OAUTH",
      error: error.message,
      stack: error.stack,
    });
    sentryService.captureException(error, {
      tags: { type: "oauth-init" },
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// Processes the OAuth callback from Google
const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies.oauth_state;

    // Verify state parameter (CSRF protection)
    if (!state || !storedState || state !== storedState) {
      logger.warn("OAuth state mismatch", {
        type: "OAUTH",
        receivedState: state,
        storedState: storedState,
      });
      return res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
    }

    // Clear state cookie
    res.clearCookie("oauth_state");

    if (!code) {
      logger.warn("OAuth callback missing authorization code", {
        type: "OAUTH",
      });
      return res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
    }

    // Exchange code for tokens
    const tokenData = await googleOAuthService.exchangeCodeForToken(code);
    const { access_token } = tokenData;

    // Get user info from Google
    const googleUser = await googleOAuthService.getUserInfo(access_token);
    const { id: googleId, email, name } = googleUser;

    // Check if user already exists with this Google account
    let user = await prisma.user.findFirst({
      where: {
        oauthProvider: "google",
        oauthId: googleId,
      },
    });

    if (user) {
      // User exists with this Google account - log them in
      logger.info("User logged in via Google OAuth", {
        type: "OAUTH",
        userId: user.id,
        email: user.email,
      });

      // Notify Telegram (non-blocking)
      telegramService
        .notifyLogin(user.email, user.username, "Google OAuth")
        .catch(() => {});
    } else {
      // Check if a user with this email already exists (password-based account)
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Email exists - redirect to account linking confirmation page
        // Store pending OAuth data in a temporary cookie for linking
        const linkingToken = jwt.sign(
          {
            provider: "google",
            oauthId: googleId,
            email,
            name,
            type: "oauth_link",
          },
          config.security.jwt.authSecret,
          { expiresIn: "10m" }
        );

        res.cookie("oauth_link_token", linkingToken, {
          maxAge: 10 * 60 * 1000, // 10 minutes
          httpOnly: true,
          secure: config.security.cookies.secure,
          sameSite: config.security.cookies.sameSite,
        });

        logger.info("OAuth account linking required", {
          type: "OAUTH",
          email,
          existingUserId: existingUser.id,
        });

        return res.redirect(
          `${
            config.frontend.url
          }/auth/link-account?provider=google&email=${encodeURIComponent(
            email
          )}`
        );
      }

      // New user - create account
      // Generate unique username from email or name
      let username = (name || email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      // Ensure username is unique
      let usernameExists = await prisma.user.findUnique({
        where: { username },
      });

      let counter = 1;
      while (usernameExists) {
        username = `${username}${counter}`;
        usernameExists = await prisma.user.findUnique({
          where: { username },
        });
        counter++;
      }

      user = await prisma.user.create({
        data: {
          username,
          email,
          password: null, // OAuth users don't have passwords
          oauthProvider: "google",
          oauthId: googleId,
        },
      });

      logger.info("User registered via Google OAuth", {
        type: "OAUTH",
        userId: user.id,
        username,
        email,
      });

      // Notify Telegram (non-blocking)
      telegramService
        .notifyRegistration(email, username, "Google OAuth")
        .catch(() => {});
    }

    // Transfer guest links if there's a guest session
    const guest = req.guest;
    if (guest && guest.guestSessionId) {
      await transferLinks(guest.guestSessionId, user.id);
      await deleteGuestSession(guest.guestSessionId);

      res.clearCookie("guestToken", {
        httpOnly: config.security.cookies.httpOnly,
        secure: config.security.cookies.secure,
        sameSite: config.security.cookies.sameSite,
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, config.security.jwt.authSecret, {
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

    // Redirect to frontend
    res.redirect(`${config.frontend.url}/dashboard`);
  } catch (error) {
    logger.error("Error during Google OAuth callback", {
      type: "OAUTH",
      error: error.message,
      stack: error.stack,
    });
    sentryService.captureException(error, {
      tags: { type: "oauth-callback" },
    });
    return res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
  }
};

// Redirect user to GitHub's authorization page
const githubAuth = async (req, res) => {
  try {
    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString("hex");

    // Store state in cookie for verification in callback
    res.cookie("oauth_state", state, {
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true,
      secure: config.security.cookies.secure,
      sameSite: config.security.cookies.sameSite,
    });

    // Generate GitHub authorization URL
    const authUrl = githubOAuthService.getAuthorizationUrl(state);

    // Redirect to GitHub
    res.redirect(authUrl);
  } catch (error) {
    logger.error("Error initiating GitHub OAuth", {
      type: "OAUTH",
      error: error.message,
      stack: error.stack,
    });
    sentryService.captureException(error, {
      tags: { type: "oauth-init" },
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

// Processes the OAuth callback from GitHub
const githubCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies.oauth_state;

    // Verify state parameter (CSRF protection)
    if (!state || !storedState || state !== storedState) {
      logger.warn("OAuth state mismatch", {
        type: "OAUTH",
        receivedState: state,
        storedState: storedState,
      });
      return res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
    }

    // Clear state cookie
    res.clearCookie("oauth_state");

    if (!code) {
      logger.warn("OAuth callback missing authorization code", {
        type: "OAUTH",
      });
      return res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
    }

    // Exchange code for tokens
    const tokenData = await githubOAuthService.exchangeCodeForToken(code);
    const { access_token } = tokenData;

    // Get user info from GitHub
    const githubUser = await githubOAuthService.getUserInfo(access_token);
    const { id: githubId, email, name } = githubUser;

    // Check if user already exists with this GitHub account
    let user = await prisma.user.findFirst({
      where: {
        oauthProvider: "github",
        oauthId: githubId,
      },
    });

    if (user) {
      // User exists with this GitHub account - log them in
      logger.info("User logged in via GitHub OAuth", {
        type: "OAUTH",
        userId: user.id,
        email: user.email,
      });

      // Notify Telegram (non-blocking)
      telegramService
        .notifyLogin(user.email, user.username, "GitHub OAuth")
        .catch(() => {});
    } else {
      // Check if a user with this email already exists (password-based account)
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Email exists - redirect to account linking confirmation page
        // Store pending OAuth data in a temporary cookie for linking
        const linkingToken = jwt.sign(
          {
            provider: "github",
            oauthId: githubId,
            email,
            name,
            type: "oauth_link",
          },
          config.security.jwt.authSecret,
          { expiresIn: "10m" }
        );

        res.cookie("oauth_link_token", linkingToken, {
          maxAge: 10 * 60 * 1000, // 10 minutes
          httpOnly: true,
          secure: config.security.cookies.secure,
          sameSite: config.security.cookies.sameSite,
        });

        logger.info("OAuth account linking required", {
          type: "OAUTH",
          email,
          existingUserId: existingUser.id,
        });

        return res.redirect(
          `${
            config.frontend.url
          }/auth/link-account?provider=github&email=${encodeURIComponent(
            email
          )}`
        );
      }

      // New user - create account
      // Generate unique username from email or name
      let username = (name || email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      // Ensure username is unique
      let usernameExists = await prisma.user.findUnique({
        where: { username },
      });

      let counter = 1;
      while (usernameExists) {
        username = `${username}${counter}`;
        usernameExists = await prisma.user.findUnique({
          where: { username },
        });
        counter++;
      }

      user = await prisma.user.create({
        data: {
          username,
          email,
          password: null, // OAuth users don't have passwords
          oauthProvider: "github",
          oauthId: githubId,
        },
      });

      logger.info("User registered via GitHub OAuth", {
        type: "OAUTH",
        userId: user.id,
        username,
        email,
      });

      // Notify Telegram (non-blocking)
      telegramService
        .notifyRegistration(email, username, "GitHub OAuth")
        .catch(() => {});
    }

    // Transfer guest links if there's a guest session
    const guest = req.guest;
    if (guest && guest.guestSessionId) {
      await transferLinks(guest.guestSessionId, user.id);
      await deleteGuestSession(guest.guestSessionId);

      res.clearCookie("guestToken", {
        httpOnly: config.security.cookies.httpOnly,
        secure: config.security.cookies.secure,
        sameSite: config.security.cookies.sameSite,
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, config.security.jwt.authSecret, {
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

    // Redirect to frontend
    res.redirect(`${config.frontend.url}/dashboard`);
  } catch (error) {
    logger.error("Error during GitHub OAuth callback", {
      type: "OAUTH",
      error: error.message,
      stack: error.stack,
    });
    sentryService.captureException(error, {
      tags: { type: "oauth-callback" },
    });
    return res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
  }
};

// Link OAuth account to a existing user
const linkOAuthAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const linkingToken = req.cookies.oauth_link_token;

    // Verify linking token exists
    if (!linkingToken) {
      logger.warn("OAuth linking attempted without token", {
        type: "OAUTH",
      });
      return errorResponse(res, ERRORS.UNAUTHORIZED);
    }

    // Verify and decode linking token
    let tokenData;
    try {
      tokenData = jwt.verify(linkingToken, config.security.jwt.authSecret);
    } catch (error) {
      logger.warn("Invalid or expired OAuth linking token", {
        type: "OAUTH",
        error: error.message,
      });
      res.clearCookie("oauth_link_token");
      return errorResponse(res, ERRORS.UNAUTHORIZED);
    }

    // Verify token type
    if (tokenData.type !== "oauth_link") {
      logger.warn("Invalid OAuth linking token type", {
        type: "OAUTH",
        tokenType: tokenData.type,
      });
      res.clearCookie("oauth_link_token");
      return errorResponse(res, ERRORS.UNAUTHORIZED);
    }

    const { provider, oauthId, email, name } = tokenData;

    // Verify password was provided
    if (!password) {
      return errorResponse(res, ERRORS.INVALID_DATA);
    }

    // Find existing user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn("OAuth linking: user not found", {
        type: "OAUTH",
        email,
      });
      res.clearCookie("oauth_link_token");
      return errorResponse(res, ERRORS.INVALID_CREDENTIALS);
    }

    // Verify user has a password (not already an OAuth-only account)
    if (!user.password) {
      logger.warn("OAuth linking: account has no password", {
        type: "OAUTH",
        userId: user.id,
      });
      res.clearCookie("oauth_link_token");
      return errorResponse(res, ERRORS.INVALID_CREDENTIALS);
    }

    // Verify password is correct
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      logger.warn("OAuth linking: incorrect password", {
        type: "OAUTH",
        userId: user.id,
      });
      return errorResponse(res, ERRORS.INVALID_CREDENTIALS);
    }

    // Check if this OAuth account is already linked to another user
    const existingOAuthUser = await prisma.user.findFirst({
      where: {
        oauthProvider: provider,
        oauthId: oauthId,
      },
    });

    if (existingOAuthUser && existingOAuthUser.id !== user.id) {
      logger.warn(
        `OAuth linking: ${provider} account already linked to another user`,
        {
          type: "OAUTH",
          provider,
          oauthId,
          existingUserId: existingOAuthUser.id,
          attemptedUserId: user.id,
        }
      );
      res.clearCookie("oauth_link_token");
      return errorResponse(res, {
        code: "OAUTH_ALREADY_LINKED",
        message: `This ${
          provider.charAt(0).toUpperCase() + provider.slice(1)
        } account is already linked to another Linkkk account`,
        statusCode: 409,
      });
    }

    // Update user with OAuth credentials
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        oauthProvider: provider,
        oauthId: oauthId,
      },
    });

    // Clear linking token
    res.clearCookie("oauth_link_token", {
      httpOnly: config.security.cookies.httpOnly,
      secure: config.security.cookies.secure,
      sameSite: config.security.cookies.sameSite,
    });

    // Transfer guest links if there's a guest session
    const guest = req.guest;
    if (guest && guest.guestSessionId) {
      await transferLinks(guest.guestSessionId, updatedUser.id);
      await deleteGuestSession(guest.guestSessionId);

      res.clearCookie("guestToken", {
        httpOnly: config.security.cookies.httpOnly,
        secure: config.security.cookies.secure,
        sameSite: config.security.cookies.sameSite,
      });
    }

    // Generate JWT token for session
    const token = jwt.sign(
      { id: updatedUser.id },
      config.security.jwt.authSecret,
      {
        expiresIn: config.security.jwt.authExpiresIn,
        algorithm: "HS256",
        issuer: "linkkk-api",
        audience: "linkkk-users",
      }
    );

    res.cookie("token", token, {
      maxAge: config.security.cookies.authMaxAge,
      httpOnly: config.security.cookies.httpOnly,
      secure: config.security.cookies.secure,
      sameSite: config.security.cookies.sameSite,
    });

    logger.info("OAuth account linked successfully", {
      type: "OAUTH",
      userId: updatedUser.id,
      email: updatedUser.email,
      provider: provider,
    });

    // Notify Telegram (non-blocking)
    telegramService
      .notifyLogin(
        updatedUser.email,
        updatedUser.username,
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth (linked)`
      )
      .catch(() => {});

    return successResponse(res, {
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    logger.error("Error during OAuth account linking", {
      type: "OAUTH",
      error: error.message,
      stack: error.stack,
    });
    sentryService.captureException(error, {
      tags: { type: "oauth-link" },
    });
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

module.exports = {
  validateSession,
  createGuestSession,
  register,
  login,
  logout,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  linkOAuthAccount,
};
