const express = require("express");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const prisma = require("../prisma/client");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const userAuthenticate = require("../middlewares/userAuthenticate");
const guestAuthenticate = require("../middlewares/guestAuthenticate");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validations/auth");

const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
const GUEST_SECRET_KEY = process.env.GUEST_SECRET_KEY;

router.post("/guest", async (req, res) => {
  try {
    const guestSession = await prisma.guestSession.create({
      data: {
        createdAt: new Date(),
      },
    });

    const guestToken = jwt.sign(
      {
        guestSessionId: guestSession.id,
      },
      GUEST_SECRET_KEY,
      {
        expiresIn: "1w",
      }
    );

    res.cookie("guestToken", guestToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(201).json({ message: "OK" });
  } catch (error) {
    return res
      .status(500)
      .json({ details: "Error al crear sesión de invitado" });
  }
});

router.get("/guest", async (req, res) => {
  const guestToken = req.cookies.guestToken;

  if (!guestToken) {
    return res.status(200).json({ isGuest: false });
  }

  try {
    const decoded = jwt.verify(guestToken, GUEST_SECRET_KEY);
    return res.status(200).json({ isGuest: true, guest: decoded });
  } catch (error) {
    return res.status(200).json({ isGuest: false });
  }
});

router.post(
  "/register",
  authenticate,
  guestAuthenticate,
  validate(registerSchema),
  async (req, res) => {
    const { username, email, password } = req.body;

    if (!req.guest) {
      return res
        .status(400)
        .json({ details: "No se ha encontrado sesión de invitado" });
    }

    const guestId = req.guest.guestSessionId;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ details: "Usuario ya registrado" });
    }

    try {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          planId: 1,
        },
      });

      if (guestId) {
        try {
          const guestLinks = await prisma.link.findMany({
            where: {
              guest_sessionId: guestId,
            },
          });

          if (guestLinks.length > 0) {
            guestLinks.forEach(async (link) => {
              await prisma.link.update({
                where: {
                  id: link.id,
                },
                data: {
                  userId: user.id,
                },
              });
            });
          }

          // await prisma.guestSession.delete({
          //   where: {
          //     id: guestId,
          //   },
          // });

          // res.clearCookie("guestToken");
        } catch (error) {
          console.error(error);
        }
      }

      res.status(201).json({ message: "Usuario registrado con éxito", user });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Error al registrar usuario",
        details: JSON.stringify(error),
      });
    }
  }
);

router.post(
  "/login",
  authenticate,
  guestAuthenticate,
  validate(loginSchema),
  async (req, res) => {
    const { username, password } = req.body;
    const guestId = req.guest?.guestSessionId;

    try {
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (!user) {
        return res.status(401).json({ details: "Credenciales incorrectas" });
      }

      const isPasswordCorrect = await bcryptjs.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ details: "Credenciales incorrectas" });
      }

      if (guestId) {
        try {
          const guest = await prisma.guestSession.findUnique({
            where: { id: guestId },
          });

          if (!guest) {
            return res
              .status(404)
              .json({ details: "Sesión de invitado no encontrada" });
          }

          const guestLinks = await prisma.link.findMany({
            where: {
              guest_sessionId: guestId,
            },
          });

          if (guestLinks.length > 0) {
            guestLinks.forEach(async (link) => {
              await prisma.link.update({
                where: { id: link.id },
                data: { userId: user.id },
              });
            });
          }

          await prisma.guestSession.delete({
            where: { id: guestId },
          });
        } catch (error) {
          return res.status(500).json({
            error: "Failed to delete guest session",
          });
        }
      }

      const userData = {
        id: user.id,
        username: user.username,
        planId: user.planId,
      };

      const tokenPayload = {
        id: user.id,
      };

      const token = jwt.sign(tokenPayload, AUTH_SECRET_KEY, {
        expiresIn: "1w",
      });

      res.clearCookie("guestToken");
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      res.status(200).json({
        message: "OK",
        user: userData,
      });
    } catch (error) {
      res.status(500).json({ details: "Error al autenticar" });
    }
  }
);

router.get("/status", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, AUTH_SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    const userData = {
      userId: user.id,
      username: user.username,
      planId: user.planId,
    };

    return res.status(200).json({ isAuthenticated: true, user: userData });
  } catch (error) {
    console.error("Error en el token de autenticación:", error);
    return res.status(200).json({ isAuthenticated: false });
  }
});

router.get("/logout", authenticate, userAuthenticate, async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "OK" });
});

module.exports = router;
