const { date } = require("zod");
const prisma = require("../prisma/client");
const { validateApiKey } = require("../utils/apiKey");

const createApiKey = async (req, res) => {
  const user = req.user;

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const apiKey = Array(32)
    .fill(null)
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        apiKey: "lk_" + apiKey,
      },
    });

    return res.json({ apiKey: updatedUser.apiKey });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createLink = async (req, res) => {
  const { apiKey, longUrl } = req.body;

  if (!apiKey) {
    return res.status(400).json({ message: "API key is required" });
  }

  if (!(await validateApiKey(apiKey))) {
    return res.status(401).json({ message: "Invalid API keyy" });
  }

  if (!longUrl) {
    return res.status(400).json({ message: "Long URL is required" });
  }

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomString = Array(10)
    .fill(null)
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");

  const user = await prisma.user.findFirst({
    where: {
      apiKey: apiKey,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid API key" });
  }

  try {
    const link = await prisma.link.create({
      data: {
        userId: user.id,
        longUrl,
        shortUrl: randomString,
      },
    });

    return res.json(link);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteLink = async (req, res) => {
  const { apiKey, shortUrl } = req.body;

  if (!apiKey) {
    return res.status(400).json({ message: "API key is required" });
  }

  if (!(await validateApiKey(apiKey))) {
    return res.status(401).json({ message: "Invalid API key" });
  }

  if (!shortUrl) {
    return res.status(400).json({ message: "Short URL is required" });
  }

  const user = await prisma.user.findFirst({
    where: {
      apiKey: apiKey,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid API key" });
  }

  try {
    const link = await prisma.link.delete({
      where: {
        shortUrl: shortUrl,
        userId: user.id,
      },
    });

    return res.json(link);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createApiKey,
  createLink,
  deleteLink,
};
