const planLimits = {
  guest: {
    links: 3,
    linkExpiration: 7,
    rulesPerLink: 1,
    conditionsPerRule: 1,
    linkAnalytics: {
      linkCharts: false,
      linkAccesses: 0,
      linkAccessesDuration: 7,
    },
  },
  user: {
    links: 50,
    linkExpiration: null,
    rulesPerLink: 3,
    conditionsPerRule: 2,
    linkAnalytics: {
      linkCharts: true,
      linkAccesses: 20,
      linkAccessesDuration: 30,
    },
  },
  pro: {
    links: null,
    linkExpiration: null,
    rulesPerLink: null,
    conditionsPerRule: null,
    linkAnalytics: {
      linkCharts: true,
      linkAccesses: null,
      linkAccessesDuration: null,
    },
  },
};

/**
 * Get limits for a user based on their role
 * @param {Object} user - User object with role property
 * @param {Object} guest - Guest session object
 * @returns {Object} Limits object for the user's plan
 */
const getLimitsForUser = (user, guest) => {
  // Authenticated users take priority over lingering guest sessions
  if (user && user.role) {
    const role = user.role.toLowerCase();
    return planLimits[role === "pro" ? "pro" : "user"];
  }

  if (guest) return planLimits.guest;

  // If no user or guest, default to guest limits
  return planLimits.guest;
};

module.exports = planLimits;
module.exports.getLimitsForUser = getLimitsForUser;
