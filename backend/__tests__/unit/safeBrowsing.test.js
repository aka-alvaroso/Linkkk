/**
 * @jest-environment node
 */

jest.mock("../../v2/utils/logger", () => ({ warn: jest.fn(), error: jest.fn(), info: jest.fn() }));

const safeBrowsing = require("../../v2/services/safeBrowsing");

const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });

describe("safeBrowsing.checkUrl", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.GOOGLE_SAFE_BROWSING_KEY = "test-key";
    delete process.env.SAFE_BROWSING_TIMEOUT_MS;
    safeBrowsing._resetCache();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
    delete process.env.GOOGLE_SAFE_BROWSING_KEY;
  });

  it("skips without calling Google when no key is configured", async () => {
    delete process.env.GOOGLE_SAFE_BROWSING_KEY;
    const result = await safeBrowsing.checkUrl("https://letreco.wasmer.app/");
    expect(result).toMatchObject({ flagged: false, skipped: "not_configured" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("flags a URL with matches and reports the threat types", async () => {
    global.fetch.mockResolvedValue(
      okResponse({
        matches: [
          { threatType: "SOCIAL_ENGINEERING" },
          { threatType: "SOCIAL_ENGINEERING" },
          { threatType: "MALWARE" },
        ],
      })
    );

    const result = await safeBrowsing.checkUrl("https://letreco.wasmer.app/");

    expect(result).toEqual({ flagged: true, threats: ["SOCIAL_ENGINEERING", "MALWARE"] });
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toContain("threatMatches:find?key=test-key");
    const body = JSON.parse(init.body);
    expect(body.threatInfo.threatEntries).toEqual([{ url: "https://letreco.wasmer.app/" }]);
    expect(body.threatInfo.threatTypes).toContain("SOCIAL_ENGINEERING");
  });

  it("treats an empty response as clean", async () => {
    global.fetch.mockResolvedValue(okResponse({}));
    const result = await safeBrowsing.checkUrl("https://example.com/");
    expect(result).toEqual({ flagged: false, threats: [] });
  });

  it("caches results per URL", async () => {
    global.fetch.mockResolvedValue(okResponse({ matches: [{ threatType: "MALWARE" }] }));

    await safeBrowsing.checkUrl("https://bad.example/");
    const second = await safeBrowsing.checkUrl("https://bad.example/");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(second).toMatchObject({ flagged: true, cached: true });
  });

  it("fails open on API errors and does not cache them", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });

    const first = await safeBrowsing.checkUrl("https://example.com/");
    await safeBrowsing.checkUrl("https://example.com/");

    expect(first).toMatchObject({ flagged: false, skipped: "api_error" });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("fails open on network errors", async () => {
    global.fetch.mockRejectedValue(new Error("ECONNRESET"));
    const result = await safeBrowsing.checkUrl("https://example.com/");
    expect(result).toMatchObject({ flagged: false, skipped: "network_error" });
  });

  it("fails open when Google is slower than the timeout", async () => {
    global.fetch.mockImplementation(
      (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => {
            const err = new Error("aborted");
            err.name = "AbortError";
            reject(err);
          });
        })
    );

    const started = Date.now();
    const result = await safeBrowsing.checkUrl("https://slow.example/", { timeoutMs: 50 });

    expect(result).toMatchObject({ flagged: false, skipped: "timeout" });
    expect(Date.now() - started).toBeLessThan(1000);
  });
});
