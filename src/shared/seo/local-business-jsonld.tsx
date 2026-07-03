import { BASE_URL, BUSINESS } from "./business";

/**
 * LocalBusiness + Person structured data for local SEO around Tehuacán, Puebla.
 * Drop <LocalBusinessJsonLd /> on any page (homepage, Tehuacán landing).
 */
export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "EducationalOrganization"],
        "@id": `${BASE_URL}/#business`,
        name: BUSINESS.name,
        description:
          "Clases privadas de inglés 1 a 1 en Tehuacán, Puebla y en línea. Inglés de negocios, conversación y preparación para entrevistas con un tutor nativo estadounidense.",
        url: BASE_URL,
        email: BUSINESS.email,
        telephone: BUSINESS.phone,
        image: `${BASE_URL}/og-image`,
        priceRange: BUSINESS.priceRange,
        currenciesAccepted: BUSINESS.currency,
        knowsLanguage: ["en", "es"],
        founder: {
          "@type": "Person",
          name: BUSINESS.founder,
          jobTitle: "Tutor de inglés",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: BUSINESS.city,
          addressRegion: BUSINESS.state,
          addressCountry: BUSINESS.countryCode,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: BUSINESS.geo.lat,
          longitude: BUSINESS.geo.lng,
        },
        areaServed: BUSINESS.areaServed.map((name) => ({
          "@type": "Place",
          name,
        })),
        availableLanguage: ["Spanish", "English"],
      },
      {
        "@type": "Person",
        "@id": `${BASE_URL}/#mauricio`,
        name: BUSINESS.founder,
        jobTitle: "Tutor de inglés nativo",
        worksFor: { "@id": `${BASE_URL}/#business` },
        knowsLanguage: ["English", "Spanish"],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/** Course structured data — advertises the tutoring offering with local reach. */
export function CourseJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url,
    inLanguage: "es",
    provider: {
      "@type": "Organization",
      name: BUSINESS.name,
      "@id": `${BASE_URL}/#business`,
      url: BASE_URL,
    },
    offers: {
      "@type": "Offer",
      category: "Clases de inglés",
      priceCurrency: BUSINESS.currency,
      availability: "https://schema.org/InStock",
    },
    availableLanguage: ["es", "en"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
