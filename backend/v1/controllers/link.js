const prisma = require("../prisma/client");
const { renderError, renderPasswordForm } = require("../utils/templates");
const jwt = require("jsonwebtoken");
const {
  getClientIp,
  getCountryFromIP,
  isVPNOrProxy,
  getDeviceType,
} = require("../utils/userData");

function isActive (link) {
  return link.status;
}
function isPassword (link) {
  return link.password;
}
function isAccessLimit (link) {
  return link.accessLimit && link.accessLimit <= link.accesses.length;
}
function isExpired (link) {
  // TODO: ¿Cuando se accede a un enlace expirado, se guarda como inactivo?
  return link.d_expire && new Date(link.d_expire) < new Date();
}
function isBlockedCountry (link, country) {
  return link.blockedCountries.some(
    (blockedCountry) =>
      blockedCountry.code.toUpperCase() === country.toUpperCase()
  );
}

const createLink = async (req, res) => {
  if (req.guest?.guestSessionId) {
    await prisma.link.deleteMany({
      where: {
        guest_sessionId: req.guest.guestSessionId,
        d_expire: { lt: new Date() },
      },
    });

    const count = await prisma.link.count({
      where: {
        guest_sessionId: req.guest.guestSessionId,
      },
    });

    if (count >= 10) {
      return res.status(400).json({ details: "Límite de enlaces alcanzado" });
    }
  }

  let user;

  if (req.user) {
    user = await prisma.user.findUnique({
      where: { id: Number(req.user?.id) },
    });
  }

  if (user && user.planId !== 2) {
    const count = await prisma.link.count({
      where: {
        userId: req.user.id,
      },
    });

    if (count >= 50) {
      return res.status(400).json({ details: "Límite de enlaces alcanzado" });
    }
  }

  try {
    const {
      longUrl,
      groupId,
      tags,
      sufix,
      password,
      accessLimit,
      blockedCountries,
      mobileUrl,
      desktopUrl,
      expirationDate,
      metadataTitle,
      metadataDescription,
      metadataImage,
      useMetadata,
    } = req.body;

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomString = Array(10)
      .fill(null)
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join("");

    if (sufix) {
      const linkExists = await prisma.link.findUnique({
        where: { sufix: sufix },
      });

      if (linkExists) {
        return res.status(400).json({ details: "Sufijo ya existe" });
      }
    }

    const isGuest = !!req.guest;
    let user;

    if (!isGuest) {
      user = await prisma.user.findUnique({
        where: { id: Number(req.user?.id) },
      });
    }

    const proSettings = !isGuest && user?.planId === 2;

    const link = await prisma.link.create({
      data: {
        userId: !isGuest ? Number(user?.id) : null,
        guest_sessionId: isGuest ? Number(req.guest?.guestSessionId) : null,
        longUrl,
        shortUrl: randomString,
        groupId: isGuest ? null : groupId ? Number(groupId) : null,
        sufix: sufix && proSettings ? sufix : null,
        password: password && proSettings ? password : null,
        accessLimit: accessLimit && proSettings ? Number(accessLimit) : null,
        blockedCountries: {
          connect: proSettings
            ? blockedCountries?.map((countryId) => ({
              id: Number(countryId),
            }))
            : [],
        },
        tags: {
          connect: !isGuest
            ? tags?.map((tagId) => ({ id: Number(tagId) }))
            : [],
        },
        mobileUrl: mobileUrl && proSettings ? mobileUrl : null,
        desktopUrl: desktopUrl && proSettings ? desktopUrl : null,
        d_expire: isGuest
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : expirationDate && proSettings
            ? new Date(expirationDate)
            : null,
        metadataTitle: useMetadata && proSettings ? metadataTitle : null,
        metadataDescription:
          useMetadata && proSettings ? metadataDescription : null,
        metadataImage: useMetadata && proSettings ? metadataImage : null,
        useCustomMetadata: useMetadata && proSettings,
      },
    });

    res.status(201).json(link);
  } catch (error) {
    console.error("Error al crear link:", error);
    res.status(500).json({ details: error.message });
  }
};

const getLinkRedirect = async (req, res) => {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"];
    const country = (await getCountryFromIP(ip)) || "XX";
    const isVPN = await isVPNOrProxy(ip);
    const deviceType = getDeviceType(userAgent);
    const { shortCode } = req.params;
    const isBot = /bot|facebook|twitter|discord|crawl|spider|preview/i.test(
      userAgent
    );

    const accessMethod = req.query.qr == "true" ? "QRCODE" : "LINK";

    if (!shortCode) {
      return res.status(400).json({ details: "Missing shortCode parameter" });
    }

    let link = await prisma.link.findUnique({
      where: { sufix: shortCode },
      include: { blockedCountries: true, accesses: true },
    });
    if (!link)
      link = await prisma.link.findUnique({
        where: { shortUrl: shortCode },
        include: { blockedCountries: true, accesses: true },
      });

    if (!link) {
      return res.redirect(302, "https://linkkk.dev/notfound");
    }

    if (isBot) {
      // Usar metadatos personalizados si existen y están habilitados
      const title =
        link.useCustomMetadata && link.metadataTitle
          ? link.metadataTitle
          : "Linkkk - Potencia tus enlaces al siguiente nivel en segundos";
      const description =
        link.useCustomMetadata && link.metadataDescription
          ? link.metadataDescription
          : "Genera enlaces cortos y únicos, customizalos con ajustes únicos y echa un vistazo a sus estadísticas. Genera códigos QR y facilita el uso a todo el mundo.";
      const image =
        link.useCustomMetadata && link.metadataImage
          ? link.metadataImage
          : "https://linkkk.dev/images/metadataImage.png";

      return res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="https://linkkk.dev/r/${shortCode}" />
          <meta property="og:type" content="website" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:domain" content="linkkk.dev" />
          <meta name="twitter:url" content="https://linkkk.dev/r/${shortCode}" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${image}" />
          <meta http-equiv="refresh" content="0;url=https://linkkk.dev/r/${shortCode}" />
          <title>${title || "Redireccionando..."}</title>
        </head>
        <body>
          <p>Redirigiendo...</p>
        </body>
        </html>`);
    } else {
      // Estado del enlace
      if (!isActive(link)) {
        return res.send(renderError("Error", "El enlace no está activo."));
      }

      // Límite de accesos
      if (isAccessLimit(link)) {
        return res.send(
          renderError("Error", "Este enlace no admite más accesos.")
        );
      }

      // Fecha de expiración
      if (isExpired(link)) {
        return res.send(renderError("Error", "Este enlace ha caducado."));
      }

      // País bloqueado
      if (isBlockedCountry(link, country)) {
        return res.send(
          renderError("Error", "Este enlace está bloqueado en tu país.")
        );
      }

      // Contraseña
      if (isPassword(link)) {
        const userData = {
          ip: ip,
          isVPN: isVPN,
          country: country,
          deviceType: deviceType,
          method: accessMethod,
        };
        return res.send(
          renderPasswordForm(
            link.shortUrl,
            "",
            encodeURIComponent(JSON.stringify(userData))
          )
        );
      }

      let url = link.longUrl;

      // Dispositivo
      if (deviceType === "MOBILE") {
        if (link.mobileUrl) {
          url = link.mobileUrl;
        }

        if (link.desktopUrl && !link.mobileUrl) {
          return res.send(
            renderError(
              "Error",
              "Este enlace no tiene una URL para dispositivos móviles."
            )
          );
        }

        if (!link.mobileUrl && !link.desktopUrl) {
          url = link.longUrl;
        }
      } else {
        if (link.desktopUrl) {
          url = link.desktopUrl;
        }

        if (link.mobileUrl && !link.desktopUrl) {
          return res.send(
            renderError(
              "Error",
              "Este enlace no tiene una URL para dispositivos de escritorio."
            )
          );
        }

        if (!link.mobileUrl && !link.desktopUrl) {
          url = link.longUrl;
        }
      }

      const access = await prisma.access.create({
        data: {
          linkId: Number(link.id),
          device: deviceType,
          ip,
          is_vpn: isVPN.toString(),
          country,
          method: accessMethod,
        },
      });

      // Redireccionar
      return res.redirect(302, url);
    }
  } catch (error) {
    console.error("Error al recuperar link:", error);
    res.status(500).json({ details: error.message });
  }
};

const postLinkPassword = async (req, res) => {
  const { shortCode } = req.params;
  const { password, userData } = req.body;

  const parsedUserData = userData
    ? JSON.parse(decodeURIComponent(userData))
    : {};

  let link = await prisma.link.findUnique({
    where: { sufix: shortCode },
    include: { blockedCountries: true, accesses: true },
  });
  if (!link)
    link = await prisma.link.findUnique({
      where: { shortUrl: shortCode },
      include: { blockedCountries: true, accesses: true },
    });

  if (!link) {
    return res.status(404).send(renderError("Error", "Link not found"));
  }

  if (link.password !== password) {
    // Contraseña incorrecta, vuelve a mostrar el form con error
    return res.send(
      renderPasswordForm(
        shortCode,
        "Contraseña incorrecta",
        encodeURIComponent(JSON.stringify(parsedUserData))
      )
    );
  }

  let url = link.longUrl;

  // Dispositivo
  if (userData.deviceType === "MOBILE") {
    if (link.mobileUrl) {
      url = link.mobileUrl;
    }

    if (link.desktopUrl && !link.mobileUrl) {
      return res.send(
        renderError(
          "Error",
          "Este enlace no tiene una URL para dispositivos móviles."
        )
      );
    }

    if (!link.mobileUrl && !link.desktopUrl) {
      url = link.longUrl;
    }
  } else {
    if (link.desktopUrl) {
      url = link.desktopUrl;
    }

    if (link.mobileUrl && !link.desktopUrl) {
      return res.send(
        renderError(
          "Error",
          "Este enlace no tiene una URL para dispositivos de escritorio."
        )
      );
    }

    if (!link.mobileUrl && !link.desktopUrl) {
      url = link.longUrl;
    }
  }

  const access = await prisma.access.create({
    data: {
      linkId: Number(link.id),
      device: parsedUserData.deviceType,
      ip: parsedUserData.ip,
      is_vpn: parsedUserData.isVPN.toString(),
      country: parsedUserData.country,
      method: parsedUserData.method,
    },
  });

  return res.redirect(302, url);
};

const getLinkDetails = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "No token provided - Link details" });
    }

    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).json({ details: "Missing shortCode parameter" });
    }

    const link = await prisma.link.findFirst({
      where: {
        OR: [{ shortUrl: shortCode }, { sufix: shortCode }],
      },
      include: {
        accesses: true,
        group: true,
        tags: true,
        blockedCountries: true,
      },
    });

    if (!link || link.userId !== req.user.id) {
      return res.status(404).json({ details: "Link not found" });
    }

    res.status(200).json(link);
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
};

const getLinksByUserId = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestId = req.guest?.guestSessionId;

    const links = await prisma.link.findMany({
      where: userId
        ? { userId: Number(userId) }
        : guestId
          ? { guest_sessionId: Number(guestId) }
          : {},
      include: {
        group: true,
        tags: true,
        blockedCountries: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (links.length === 0) {
      return res.status(200).json({ links: [] });
    }

    res.status(200).json({ links });
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
};

// TODO: Optimización y claridad del código al recuperar stats
const getLinkStats = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ details: "Token no proporcionado - Link stats" });
    }

    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).json({ details: "Falta el parámetro shortCode" });
    }

    // Obtener el enlace con accesos
    const link = await prisma.link.findFirst({
      where: {
        OR: [{ shortUrl: shortCode }, { sufix: shortCode }],
      },
      include: {
        accesses: true,
      },
    });

    if (!link || link.userId !== req.user.id) {
      return res.status(404).json({ details: "Enlace no encontrado" });
    }

    const accesses = link.accesses;

    const totalAccesses = accesses.length;

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return {
        date: date.setHours(0, 0, 0, 0),
        day:
          i === 0
            ? "Hoy"
            : [
              "Domingo",
              "Lunes",
              "Martes",
              "Miércoles",
              "Jueves",
              "Viernes",
              "Sábado",
            ][date.getDay()],
        clics: 0,
      };
    });

    const accessMap = accesses.reduce((acc, access) => {
      const accessDate = new Date(access.date).setHours(0, 0, 0, 0);
      const day = last7Days.find((d) => d.date === accessDate);
      if (day) {
        day.clics += 1;
      }
      return acc;
    }, {});

    const last7DaysFormatted = last7Days.map(({ day, clics }) => ({
      day,
      clics,
    }));

    const mobileAccesses = accesses.filter(
      (access) => access.device === "MOBILE"
    ).length;
    const qrAccesses = accesses.filter(
      (access) => access.method === "QRCODE"
    ).length;

    res.status(200).json({
      accesses,
      last7Days: last7DaysFormatted.reverse(),
      mobileAccesses,
      desktopAccesses: totalAccesses - mobileAccesses,
      qrAccesses,
      linkAccesses: totalAccesses - qrAccesses,
    });
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
};

// TODO: Optimización y claridad del código al actualizar un link
const updateLink = async (req, res) => {
  try {
    const {
      id,
      longUrl,
      status,
      groupId,
      tags,
      d_expire,
      password,
      accessLimit,
      blockedCountries,
      mobileUrl,
      desktopUrl,
      sufix,
      metadataTitle,
      metadataDescription,
      metadataImage,
      useMetadata,
    } = req.body;

    const existingLink = await prisma.link.findUnique({
      where: { id: Number(id) },
    });

    if (!existingLink || existingLink.userId !== req.user.id) {
      return res.status(404).json({ details: "Link no encontrado" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user?.id) },
    });

    const proSettings = user?.planId === 2;

    if (sufix && proSettings) {
      const existingLinkWithSufix = await prisma.link.findFirst({
        where: {
          sufix,
          NOT: {
            id: Number(id),
          },
        },
      });

      if (existingLinkWithSufix) {
        return res.status(400).json({ details: "Sufijo ya existe" });
      }
    }

    const updatedLink = await prisma.link.update({
      where: { id: Number(id) },
      data: {
        longUrl,
        status,
        groupId: groupId === "0" ? null : Number(groupId),
        tags: {
          set: [],
          connect: tags && tags.map((tagId) => ({ id: Number(tagId) })),
        },
        d_expire: d_expire && proSettings ? new Date(d_expire) : null,
        password: password && proSettings ? password : null,
        accessLimit: accessLimit && proSettings ? Number(accessLimit) : null,
        blockedCountries: {
          set: [],
          connect: proSettings
            ? blockedCountries?.map((countryId) => ({
              id: Number(countryId),
            }))
            : [],
        },
        mobileUrl: mobileUrl && proSettings ? mobileUrl : null,
        desktopUrl: desktopUrl && proSettings ? desktopUrl : null,
        sufix: sufix && proSettings ? sufix : null,
        metadataTitle: useMetadata && proSettings ? metadataTitle : null,
        metadataDescription:
          useMetadata && proSettings ? metadataDescription : null,
        metadataImage: useMetadata && proSettings ? metadataImage : null,
        useCustomMetadata: useMetadata && proSettings,
      },
      include: {
        group: true,
        tags: true,
        accesses: true,
      },
    });

    res.status(200).json(updatedLink);
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
};

const deleteLink = async (req, res) => {
  const userId = req.user?.id;
  const guestId = req.guest?.guestSessionId;

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ details: "Falta el parámetro id" });
    }

    const link = await prisma.link.delete({
      where: {
        id: Number(id),
        userId: userId ? Number(userId) : null,
        guest_sessionId: guestId ? Number(guestId) : null,
      },
    });

    res.status(200).json({ message: "Enlace eliminado", link });
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
};

module.exports = {
  createLink,
  getLinkRedirect,
  postLinkPassword,
  getLinkDetails,
  getLinksByUserId,
  getLinkStats,
  updateLink,
  deleteLink,
};
