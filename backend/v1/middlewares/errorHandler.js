// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const internal = err.internalMessage || err.message;

  // 👇 Log para desarrolladores (más técnico)
  console.error(`[${req.method}] ${req.originalUrl} → ${internal}`);

  // 👇 Respuesta para el cliente (más amigable)
  res.status(status).json({
    error: message,
  });
};

module.exports = errorHandler;
