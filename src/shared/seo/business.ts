// Central NAP (Name / Address / Phone) and local-SEO facts for Tu Tutor de
// Inglés. Used by structured data and page copy so the Tehuacán signals stay
// consistent across the site.

export const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

export const BUSINESS = {
  name: "Tu Tutor de Inglés",
  legalName: "Tu Tutor de Inglés",
  founder: "Mauricio Tellez",
  email: "mauricio@tututordeingles.online",
  url: BASE_URL,
  // Delivery: online (WhatsApp / Google Meet) and in-person around Tehuacán.
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
  areaServed: ["Tehuacán", "Puebla", "En línea"],
} as const;

export const WHATSAPP_SIGNUP_CTA = "Agenda tu clase gratis";
