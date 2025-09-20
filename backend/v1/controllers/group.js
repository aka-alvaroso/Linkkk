const prisma = require("../prisma/client");

const createGroup = async (req, res) => {
  const { title, description, color } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (user.planId !== 2) {
    const count = await prisma.group.count({
      where: {
        userId: req.user.id,
      },
    });

    if (count >= 5) {
      return res.status(400).json({ details: "Límite de grupos alcanzado" });
    }
  }

  const group = await prisma.group.create({
    data: {
      userId: Number(userId),
      title: title,
      description: description || "",
      color: color,
    },
  });

  res.status(201).json(group);
};

const getGroupsByUserId = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ details: "Parámetro userId no encontrado" });
  }

  const groups = await prisma.group.findMany({
    where: { userId: Number(userId) },
    orderBy: { title: "asc" },
  });

  if (!groups) {
    return res.status(404).json({ details: "Grupos no encontrados" });
  }

  res.status(200).json(groups);
};

const updateGroup = async (req, res) => {
  const { groupId, title, description, color } = req.body;
  const userId = req.user.id;

  if (title === "") {
    return res.status(400).json({ details: "El título no puede estar vacío" });
  }

  const group = await prisma.group.update({
    where: {
      id: Number(groupId),
      userId: Number(userId),
    },
    data: {
      title: title,
      description: description,
      color: color,
    },
  });

  res.status(200).json(group);
};

const deleteGroup = async (req, res) => {
  const { groupId } = req.body;
  const userId = req.user.id;

  if (!groupId) {
    return res.status(400).json({ details: "Falta el parámetro groupId" });
  }

  const group = await prisma.group.delete({
    where: {
      id: Number(groupId),
      userId: Number(userId),
    },
  });

  res.status(200).json({ message: "Grupo eliminado correctamente", group });
};

module.exports = {
  createGroup,
  getGroupsByUserId,
  updateGroup,
  deleteGroup,
};
