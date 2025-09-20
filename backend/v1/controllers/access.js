const prisma = require("../prisma/client");

const createAccess = async (req, res) => {
  try {
    const { linkId, device, ip, is_vpn, country, method } = req.body;

    if (!linkId || !device || !ip || !is_vpn || !country || !method) {
      if (!linkId) {
        return res.status(400).json({ details: "El ID del link es requerido" });
      }
      if (!device) {
        return res.status(400).json({ details: "El dispositivo es requerido" });
      }
      if (!ip) {
        return res.status(400).json({ details: "La IP es requerida" });
      }
      if (!is_vpn) {
        return res.status(400).json({ details: "Es un VPN o no" });
      }
      if (!country) {
        return res.status(400).json({ details: "El país es requerido" });
      }
      if (!method) {
        return res
          .status(400)
          .json({ error: "El tipo de acceso es requerido" });
      }
    }

    const access = await prisma.access.create({
      data: {
        linkId: Number(linkId),
        device,
        ip,
        is_vpn,
        country,
        method,
      },
    });
    res.status(201).json(access);
  } catch (error) {
    res.status(500).json({ details: "Error al crear acceso" });
  }
};

module.exports = {
  createAccess,
};
