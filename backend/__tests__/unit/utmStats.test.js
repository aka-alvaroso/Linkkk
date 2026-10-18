/**
 * @jest-environment node
 */

const { buildUtmBreakdown } = require("../../v2/utils/utmStats");

const access = (utmSource = null, utmMedium = null, utmCampaign = null) => ({
  utmSource,
  utmMedium,
  utmCampaign,
});

describe("buildUtmBreakdown", () => {
  it("returns empty lists when nothing carries a UTM", () => {
    expect(buildUtmBreakdown([access(), access()])).toEqual({
      withUtm: 0,
      sources: [],
      mediums: [],
      campaigns: [],
    });
    expect(buildUtmBreakdown([]).withUtm).toBe(0);
  });

  it("counts values per dimension and sorts by count", () => {
    const result = buildUtmBreakdown([
      access("instagram", "social", "summer"),
      access("newsletter", "email", "summer"),
      access("instagram", "social", null),
      access(),
    ]);

    expect(result.withUtm).toBe(3);
    expect(result.sources).toEqual([
      { value: "instagram", count: 2 },
      { value: "newsletter", count: 1 },
    ]);
    expect(result.mediums).toEqual([
      { value: "social", count: 2 },
      { value: "email", count: 1 },
    ]);
    expect(result.campaigns).toEqual([{ value: "summer", count: 2 }]);
  });

  it("counts an access with only one tracked param as having UTM", () => {
    expect(buildUtmBreakdown([access(null, null, "launch")]).withUtm).toBe(1);
  });

  it("keeps only the top 8 values, breaking ties alphabetically", () => {
    const accesses = "abcdefghij".split("").map((c) => access(c));
    const { sources } = buildUtmBreakdown(accesses);
    expect(sources).toHaveLength(8);
    expect(sources.map((s) => s.value)).toEqual(["a", "b", "c", "d", "e", "f", "g", "h"]);
  });
});
