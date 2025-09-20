const getClientIp = (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip;

  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") ip = "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  return ip;
};

const getCountryFromIP = async (ip) => {
  const geo = await fetch(`https://api.ipapi.is/?q=${ip}`);
  const data = await geo.json();
  return data.location.country_code;
};

const isVPNOrProxy = async (ip) => {
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1" || ip === "127.0.0.1") {
    return false;
  }
  const res = await fetch(`https://api.ipapi.is/?q=${ip}`);
  const data = await res.json();

  return data.is_proxy || data.is_vpn;
};

const getDeviceType = (userAgent) => {
  const isMobile = /mobi/i.test(userAgent);
  return isMobile ? "MOBILE" : "DESKTOP";
};

module.exports = {
  getClientIp,
  getCountryFromIP,
  isVPNOrProxy,
  getDeviceType,
};
