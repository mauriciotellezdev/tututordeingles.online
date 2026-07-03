import { expect, test } from "bun:test";
import {
  normalizeCampaignCode,
  normalizeCampaignTarget,
  createCampaign,
  DEFAULT_CAMPAIGN_TARGET,
} from "../../src/lib/models/campaign";
import { isBotUserAgent } from "../../src/lib/campaigns";

test("normalizeCampaignCode lowercases and slugifies", () => {
  expect(normalizeCampaignCode("Combi Ruta 3")).toBe("combi-ruta-3");
  expect(normalizeCampaignCode("  FLYER_OXXO  ")).toBe("flyer-oxxo");
  expect(normalizeCampaignCode("store@centro!!")).toBe("store-centro");
});

test("normalizeCampaignCode trims leading/trailing separators", () => {
  expect(normalizeCampaignCode("---combi---")).toBe("combi");
  expect(normalizeCampaignCode("__a__b__")).toBe("a-b");
});

test("normalizeCampaignCode rejects codes with no usable characters", () => {
  expect(() => normalizeCampaignCode("   ")).toThrow();
  expect(() => normalizeCampaignCode("!!!")).toThrow();
});

test("normalizeCampaignTarget defaults to the Tehuacán landing", () => {
  expect(normalizeCampaignTarget("")).toBe(DEFAULT_CAMPAIGN_TARGET);
  expect(normalizeCampaignTarget(null)).toBe(DEFAULT_CAMPAIGN_TARGET);
  expect(normalizeCampaignTarget(undefined)).toBe(DEFAULT_CAMPAIGN_TARGET);
});

test("normalizeCampaignTarget preserves absolute URLs and prefixes paths", () => {
  expect(normalizeCampaignTarget("https://example.com/x")).toBe(
    "https://example.com/x"
  );
  expect(normalizeCampaignTarget("signup")).toBe("/signup");
  expect(normalizeCampaignTarget("/clases")).toBe("/clases");
});

test("createCampaign produces sane defaults", () => {
  const c = createCampaign({ code: "Combi 01", label: "Combi ruta 3" });
  expect(c.code).toBe("combi-01");
  expect(c.label).toBe("Combi ruta 3");
  expect(c.medium).toBe("other");
  expect(c.target).toBe(DEFAULT_CAMPAIGN_TARGET);
  expect(c.active).toBe(true);
  expect(c.permanent).toBe(false);
  expect(c.scanCount).toBe(0);
  expect(c.signupCount).toBe(0);
  expect(c.fallbackCode).toBeUndefined();
});

test("createCampaign normalizes medium, target, and fallback", () => {
  const c = createCampaign({
    code: "flyer-centro",
    label: "",
    medium: "Flyer",
    target: "clases-de-ingles-en-tehuacan",
    permanent: true,
    fallbackCode: "Combi 01",
    notes: "  pegado en el OXXO  ",
  });
  expect(c.medium).toBe("flyer");
  expect(c.target).toBe("/clases-de-ingles-en-tehuacan");
  expect(c.permanent).toBe(true);
  expect(c.fallbackCode).toBe("combi-01");
  expect(c.notes).toBe("pegado en el OXXO");
  // Empty label falls back to the code.
  expect(c.label).toBe("flyer-centro");
});

test("createCampaign omits empty optional fields (strict validator safety)", () => {
  const c = createCampaign({ code: "combi-01", label: "Combi" });
  // Must be ABSENT, not null/undefined — the $jsonSchema validator rejects null.
  expect("fallbackCode" in c).toBe(false);
  expect("notes" in c).toBe(false);
});

test("isBotUserAgent flags link-preview crawlers and empty UAs", () => {
  // Real browsers → not bots (counted).
  expect(
    isBotUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    )
  ).toBe(false);
  expect(
    isBotUserAgent(
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36"
    )
  ).toBe(false);

  // Preview/scraper bots → filtered out of scan counts.
  expect(isBotUserAgent("WhatsApp/2.23")).toBe(true);
  expect(isBotUserAgent("facebookexternalhit/1.1")).toBe(true);
  expect(isBotUserAgent("Twitterbot/1.0")).toBe(true);
  expect(isBotUserAgent("TelegramBot (like TwitterBot)")).toBe(true);
  expect(isBotUserAgent("Slackbot-LinkExpanding 1.0")).toBe(true);
  expect(isBotUserAgent("Googlebot/2.1")).toBe(true);

  // Missing/blank UA → treated as bot (not counted).
  expect(isBotUserAgent(null)).toBe(true);
  expect(isBotUserAgent(undefined)).toBe(true);
  expect(isBotUserAgent("   ")).toBe(true);
});
