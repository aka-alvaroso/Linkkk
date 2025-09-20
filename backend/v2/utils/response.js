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
  }
) => {
  const response = {
    success: false,
    code,
    message,
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};
