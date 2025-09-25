const successResponse = (res, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const errorResponse = (
  res,
  {
    code = "INTERNAL_SERVER_ERROR",
    message = "Internal Server Error",
    statusCode = 500,
  },
  validation = null
) => {
  const response = {
    success: false,
    code,
    message,
  };

  // Solo agregar validation si existe
  if (validation) {
    response.validation = validation;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};
