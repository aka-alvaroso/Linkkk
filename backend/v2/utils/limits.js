const planLimits = {
  guest: {
    // Links
    links: 10,
    qrCodes: 0,
    password: false,
    geoBlocking: false,
    accessLimit: false,
    smartRedirection: false,
    sufix: false,
    metadata: false,
    defaultExpirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

    // Link Rules
    rulesPerLink: 5,

    // Groups & Tags
    groups: 0,
    tags: 0,

    // Api
    apiRequests: 0,
  },
  user: {
    // Links
    links: 50,
    qrCodes: 10,
    password: true,
    geoBlocking: true,
    accessLimit: true,
    smartRedirection: true,
    sufix: true,
    metadata: true,
    defaultExpirationDate: null,

    // Link Rules
    rulesPerLink: 20,

    // Groups & Tags
    groups: 10,
    tags: 10,

    // Api
    apiRequests: 100,
  },
};

module.exports = planLimits;
