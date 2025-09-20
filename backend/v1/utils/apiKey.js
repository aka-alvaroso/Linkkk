const prisma = require("../prisma/client");

const validateApiKey = async (apiKey) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        apiKey: apiKey,
      },
    });

    if (!user) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = {
  validateApiKey,
};
