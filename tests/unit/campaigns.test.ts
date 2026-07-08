import { expect, test } from "bun:test";
import {
  normalizeCampaignCode,
  normalizeCampaignTarget,
  createCampaign,
} from "../../src/lib/models/campaign";
import {
  isBotUserAgent,
  resolveValidDestination,
} from "../../src/lib/campaigns";

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

test("normalizeCampaignTarget defaults to the homepage", () => {
  expect(normalizeCampaignTarget("")).toBe("/");
  expect(normalizeCampaignTarget(null)).toBe("/");
  expect(normalizeCampaignTarget(undefined)).toBe("/");
});

test("normalizeCampaignTarget preserves absolute URLs and prefixes paths", () => {
  expect(normalizeCampaignTarget("https://example.com/x")).toBe(
    "https://example.com/x"
  );
  expect(normalizeCampaignTarget("join")).toBe("/join");
  expect(normalizeCampaignTarget("/clases")).toBe("/clases");
});

test("createCampaign produces sane defaults", () => {
  const c = createCampaign({ code: "Combi 01", label: "Combi ruta 3" });
  expect(c.code).toBe("combi-01");
  expect(c.label).toBe("Combi ruta 3");
  expect(c.medium).toBe("other");
  // No destination given → homepage.
  expect(c.target).toBe("/");
  expect(c.active).toBe(true);
  expect(c.permanent).toBe(false);
  expect(c.scanCount).toBe(0);
  expect(c.signupCount).toBe(0);
});

test("createCampaign derives the code from the name when none is given", () => {
  const c = createCampaign({ label: "Flyer OXXO Centro" });
  expect(c.code).toBe("flyer-oxxo-centro");
  expect(c.label).toBe("Flyer OXXO Centro");
});

test("createCampaign normalizes medium and target", () => {
  const c = createCampaign({
    code: "flyer-centro",
    label: "",
    medium: "Flyer",
    target: "club-de-conversacion-en-ingles-tehuacan",
    permanent: true,
    notes: "  pegado en el OXXO  ",
  });
  expect(c.medium).toBe("flyer");
  expect(c.target).toBe("/club-de-conversacion-en-ingles-tehuacan");
  expect(c.permanent).toBe(true);
  expect(c.notes).toBe("pegado en el OXXO");
  // Empty label falls back to the code.
  expect(c.label).toBe("flyer-centro");
});

test("createCampaign omits empty optional fields (strict validator safety)", () => {
  const c = createCampaign({ code: "combi-01", label: "Combi" });
  // Must be ABSENT, not null/undefined — the $jsonSchema validator rejects null.
  expect("notes" in c).toBe(false);
});

test("resolveValidDestination sends dead pages to the homepage", () => {
  // Known live pages pass through unchanged.
  expect(resolveValidDestination("/join")).toBe("/join");
  expect(
    resolveValidDestination("/club-de-conversacion-en-ingles-tehuacan")
  ).toBe("/club-de-conversacion-en-ingles-tehuacan");
  // A page that no longer exists → homepage.
  expect(resolveValidDestination("/clases-de-ingles-en-tehuacan")).toBe("/");
  expect(resolveValidDestination("/some-deleted-page")).toBe("/");
  // External URLs are trusted as-is.
  expect(resolveValidDestination("https://example.com/x")).toBe(
    "https://example.com/x"
  );
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
