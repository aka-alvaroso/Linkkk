const defineCountry = async (ip) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const r = await fetch(`https://api.ipquery.io/${ip}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!r.ok) throw new Error(`API returned ${r.status}`);

    const data = await r.json();
    return data.location?.country_code || "UNKNOWN";
  } catch (error) {
    console.error(`Geolocation API error: ${error.message}`);
    return "UNKNOWN";
  }
};

const defineIsVPN = async (ip) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const r = await fetch(`https://api.ipquery.io/${ip}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!r.ok) throw new Error(`API returned ${r.status}`);

    const data = await r.json();
    const isVpn =
      data.risk.is_vpn ||
      data.risk.is_tor ||
      data.risk.is_proxy ||
      data.risk.is_datacenter;

    return isVpn;
  } catch (error) {
    console.error(`Geolocation API error: ${error.message}`);
    return false;
  }
};

module.exports = {
  defineCountry,
  defineIsVPN,
};
