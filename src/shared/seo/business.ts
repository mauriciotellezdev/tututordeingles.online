// Central NAP (Name / Address / Phone) and local-SEO facts for Tu Tutor de
// Inglés. Used by structured data and page copy so the Tehuacán signals stay
// consistent across the site.

export const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

// Where every "join us" CTA points. The site is now an in-person conversation
// club: visitors register at /join (name + phone) and we call them. No online
// payment, no WhatsApp deep-links.
export const JOIN_PATH = "/join";

// Optional public phone for structured data (NAP). Digits only, incl. country
// code, via NEXT_PUBLIC_PHONE. Optional on purpose — a missing value simply
// omits the telephone from schema rather than failing the build.
const RAW_PHONE = (
  process.env.NEXT_PUBLIC_PHONE ||
  process.env.NEXT_PUBLIC_WHATSAPP ||
  ""
).replace(/\D/g, "");
export const PHONE_NUMBER = RAW_PHONE;

export const BUSINESS = {
  name: "Tu Tutor de Inglés",
  legalName: "Tu Tutor de Inglés",
  founder: "Mauricio Tellez",
  email: "mauricio@tututordeingles.online",
  phone: PHONE_NUMBER ? `+${PHONE_NUMBER}` : "",
  url: BASE_URL,
  // In-person conversation club around Tehuacán (cafés, markets, parks).
  city: "Tehuacán",
  state: "Puebla",
  stateCode: "PUE",
  country: "México",
  countryCode: "MX",
  // Approximate city-center coordinates (Tehuacán, Puebla).
  geo: { lat: 18.4616, lng: -97.4028 },
  priceRange: "$$",
  currency: "MXN",
  languages: ["es", "en"],
  areaServed: ["Tehuacán", "Puebla"],
} as const;

export const JOIN_CTA = "Reserva tu lugar";
