const prisma = require("../prisma/client");

const createTag = async (req, res) => {
  const { tagName, color } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (user.planId !== 2) {
    const count = await prisma.tag.count({
      where: {
        userId: req.user.id,
      },
    });

    if (count >= 15) {
      return res.status(400).json({ details: "Límite de tags alcanzado" });
    }
  }

  const tag = await prisma.tag.create({
    data: {
      userId: Number(userId),
      name: tagName,
      color: color,
    },
  });

  res.status(201).json(tag);
};

const getTagsByUserId = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ details: "Falta el parámetro userId" });
  }

  const tags = await prisma.tag.findMany({
    where: { userId: Number(userId) },
    orderBy: {
      name: "asc",
    },
  });

  if (!tags) {
    return res.status(404).json({ details: "Tags no encontrados" });
  }

  res.status(200).json(tags);
};

const updateTag = async (req, res) => {
  const { tagId, name, color } = req.body;
  const userId = req.user.id;

  const tag = await prisma.tag.update({
    where: { id: Number(tagId), userId: Number(userId) },
    data: { name: name, color: color },
  });

  res.status(200).json(tag);
};

const deleteTag = async (req, res) => {
  const { tagId } = req.body;
  const userId = req.user.id;

  await prisma.tag.delete({
    where: { id: Number(tagId), userId: Number(userId) },
  });

  res.status(200).json({ message: "Tag eliminado" });
};

module.exports = {
  createTag,
  getTagsByUserId,
  updateTag,
  deleteTag,
};
