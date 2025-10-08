const defineCountry = async (ip) => {
  const r = await fetch(`https://api.ipquery.io/${ip}`);
  const data = await r.json();
  const country = data.location.country_code || "NA";

  return country;
};

const defineIsVPN = async (ip) => {
  const r = await fetch(`https://api.ipquery.io/${ip}`);
  const data = await r.json();
  const isVpn =
    data.risk.is_vpn ||
    data.risk.is_tor ||
    data.risk.is_proxy ||
    data.risk.is_datacenter;

  return isVpn;
};

module.exports = {
  defineCountry,
  defineIsVPN,
};
