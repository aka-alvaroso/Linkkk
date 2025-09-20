const jwt = require("jsonwebtoken");
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
const GUEST_SECRET_KEY = process.env.GUEST_SECRET_KEY;

function authenticate(req, res, next) {
  const token = req.cookies.token;
  const guestToken = req.cookies.guestToken;

  if (!token && !guestToken) {
    return res.status(401).json({ details: "Token no proporcionado" });
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, AUTH_SECRET_KEY);
      req.user = decoded;
      return next();
    } catch (error) {
      console.log("Invalid user token (ignorable if guest):", error.message);
    }
  }

  if (guestToken) {
    try {
      const decoded = jwt.verify(guestToken, GUEST_SECRET_KEY);
      req.guest = decoded;
      return next();
    } catch (error) {
      console.log("Invalid guest token (ignorable if user):", error.message);
    }
  }

  return res.status(401).json({ details: "Sesión inválida o caducada" });
}

module.exports = authenticate;
