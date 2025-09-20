const prisma = require("../prisma/client");

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        plan: true,
        links: true,
        groups: true,
        tags: true,
      },
    });

    if (!user) {
      return res.status(404).json({ details: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ details: "Error al obtener usuario" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username, email, password, planId } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: Number(req.user.id) },
      data: {
        username,
        email,
        password,
        planId: Number(planId),
      },
      include: {
        plan: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ details: "Error al actualizar usuario" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ details: "Error al eliminar usuario" });
  }
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
};
