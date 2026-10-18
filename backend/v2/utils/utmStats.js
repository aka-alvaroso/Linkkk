/**
 * Aggregation of the utm_* columns stored on Access rows for the stats endpoint.
 */

const TOP_N = 8;

const topValues = (accesses, column) => {
  const counts = {};
  for (const access of accesses) {
    const value = access[column];
    if (value) counts[value] = (counts[value] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, TOP_N);
};

/**
 * @param {Array<object>} accesses - Rows with utmSource/utmMedium/utmCampaign
 * @returns {{ withUtm: number, sources, mediums, campaigns }}
 *   withUtm is the number of accesses carrying at least one of the three
 *   tracked utm params; each list is the top values as { value, count }.
 */
const buildUtmBreakdown = (accesses) => ({
  withUtm: accesses.filter((a) => a.utmSource || a.utmMedium || a.utmCampaign).length,
  sources: topValues(accesses, "utmSource"),
  mediums: topValues(accesses, "utmMedium"),
  campaigns: topValues(accesses, "utmCampaign"),
});

module.exports = { buildUtmBreakdown };
