const planLimits = {
  guest: {
    // Links
    links: 10,
    defaultExpirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

    // Link Rules
    rulesPerLink: 1,
    conditionsPerRule: 1,
  },
  user: {
    // Links
    links: 50,
    defaultExpirationDate: null,

    // Link Rules
    rulesPerLink: 3,
    conditionsPerRule: 2,
  },
};

module.exports = planLimits;
