/**
 * @jest-environment node
 */

const { updateLinkSchema } = require("../../v2/validators/link");

const parse = (utmParams) => updateLinkSchema.safeParse({ utmParams });

describe("link utmParams", () => {
  it("accepts UTM and custom params and trims values", () => {
    const result = parse([
      { key: "utm_source", value: "newsletter" },
      { key: "utm_campaign", value: "  black-friday " },
      { key: "ref", value: "Partner 42" },
    ]);
    expect(result.success).toBe(true);
    expect(result.data.utmParams[1].value).toBe("black-friday");
  });

  it("accepts an empty list (clears the saved params) and an omitted field", () => {
    expect(parse([]).success).toBe(true);
    expect(updateLinkSchema.safeParse({}).success).toBe(true);
  });

  it("rejects unsafe or reserved keys and empty values", () => {
    expect(parse([{ key: "utm source", value: "x" }]).success).toBe(false);
    expect(parse([{ key: "a[b]", value: "x" }]).success).toBe(false);
    expect(parse([{ key: "src", value: "qr" }]).success).toBe(false);
    expect(parse([{ key: "", value: "x" }]).success).toBe(false);
    expect(parse([{ key: "utm_source", value: "   " }]).success).toBe(false);
  });

  it("rejects repeated names, ignoring case", () => {
    expect(parse([{ key: "utm_source", value: "a" }, { key: "UTM_SOURCE", value: "b" }]).success).toBe(false);
  });

  it("limits the list to 10 params and values to 500 characters", () => {
    const many = Array.from({ length: 11 }, (_, i) => ({ key: `p${i}`, value: "x" }));
    expect(parse(many).success).toBe(false);
    expect(parse(many.slice(0, 10)).success).toBe(true);
    expect(parse([{ key: "p", value: "x".repeat(501) }]).success).toBe(false);
  });

  it("rejects values that are not a list of key/value objects", () => {
    expect(updateLinkSchema.safeParse({ utmParams: "utm_source=x" }).success).toBe(false);
    expect(updateLinkSchema.safeParse({ utmParams: [{ key: "a" }] }).success).toBe(false);
  });
});
