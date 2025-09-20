const prisma = require("../prisma/client");
const { generateQrCode } = require("../utils/qrCode");

const createQrCode = async (req, res) => {
  const { linkId } = req.body;
  const userId = req.user.id;

  try {
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: { user: true },
    });

    if (!link || link.userId !== userId) {
      return res.status(404).json({ details: "Enlace no encontrado" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ details: "Usuario no encontrado" });
    }

    // Si no es PRO no genera qr
    if (user.planId !== 2) {
      return res.status(401).json({ details: "No es una suscripción" });
    }

    const qrCode = await generateQrCode(
      "https://linkkk.dev/r/" + link.shortUrl + "?qr=true"
    );

    const newLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        qrBinaryBytes: Buffer.from(qrCode),
      },
    });

    res.status(200).json(newLink);
  } catch (error) {
    console.error("Error al crear el código QR:", error);
    res.status(500).json({ details: "Error al crear el código QR" });
  }
};

module.exports = {
  createQrCode,
};
