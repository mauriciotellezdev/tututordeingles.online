// Central NAP (Name / Address / Phone) and local-SEO facts for Tu Tutor de
// Inglés. Used by structured data and page copy so the Tehuacán signals stay
// consistent across the site.

export const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

// Single source of truth for the public WhatsApp/phone number. Set
// NEXT_PUBLIC_WHATSAPP in env (digits only, incl. country code). Everything
// else (schema telephone, footer, pricing, CTAs) derives from it. No fallback
// on purpose: a missing value must fail loudly at build/render, never silently
// serve a wrong number.
const RAW_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;
if (!RAW_WHATSAPP) {
  throw new Error(
    "NEXT_PUBLIC_WHATSAPP is not set. Add it to your environment (Vercel dashboard + .env files)."
  );
}
export const WHATSAPP_NUMBER = RAW_WHATSAPP.replace(/\D/g, "");
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export const BUSINESS = {
  name: "Tu Tutor de Inglés",
  legalName: "Tu Tutor de Inglés",
  founder: "Mauricio Tellez",
  email: "mauricio@tututordeingles.online",
  phone: `+${WHATSAPP_NUMBER}`,
  whatsapp: WHATSAPP_LINK,
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
