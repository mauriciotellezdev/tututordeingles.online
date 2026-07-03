import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";
import "../globals.css";

import Header from "./layout/header";
import Footer from "./layout/footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const BASE =
  process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") || "/";

  return {
    title: {
      default: "Tu Tutor de Inglés — Clases privadas 1 a 1 con Mauricio Tellez",
      template: "%s | Tu Tutor de Inglés",
    },
    description:
      "Clases privadas de inglés en Tehuacán, Puebla y en línea. Aprende inglés real con un tutor nativo estadounidense 1 a 1 — presencial en cafés locales o por WhatsApp. Inglés de negocios, conversación y entrevistas.",
    keywords: [
      "clases de inglés en Tehuacán",
      "inglés Tehuacán",
      "tutor de inglés Tehuacán",
      "clases de inglés Puebla",
      "clases de inglés en línea",
      "inglés de negocios",
      "profesor de inglés nativo",
    ],
    metadataBase: new URL(BASE),
    alternates: {
      canonical: `${BASE}${pathname}`,
    },
    openGraph: {
      title: "Tu Tutor de Inglés — Clases privadas 1 a 1",
      description:
        "Clases privadas de inglés para profesionales hispanohablantes. Aprende inglés real con un tutor nativo 1 a 1.",
      url: "/",
      siteName: "Tu Tutor de Inglés",
      locale: "es_MX",
      type: "website",
      images: [
        {
          url: "/og-image",
          width: 1200,
          height: 630,
          alt: "Tu Tutor de Inglés",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Tu Tutor de Inglés — Clases privadas 1 a 1",
      description:
        "Clases privadas de inglés para profesionales hispanohablantes. Aprende inglés real con un tutor nativo 1 a 1.",
      images: ["/og-image"],
    },
    icons: {
      icon: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${manrope.variable} bg-[#0f1729] text-white antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
