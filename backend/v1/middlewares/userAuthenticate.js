function userAuthenticate(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ details: "Token no proporcionado - User auth" });
  }

  return next();
}

module.exports = userAuthenticate;
