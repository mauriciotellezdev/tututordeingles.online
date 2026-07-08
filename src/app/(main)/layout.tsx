import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";
import "../globals.css";

import Header from "./layout/header";
import Footer from "./layout/footer";
import { AnalyticsAndConsent } from "@/shared/analytics/analytics-and-consent";

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
      default:
        "Tu Tutor de Inglés — Club de conversación en inglés en Tehuacán",
      template: "%s | Tu Tutor de Inglés",
    },
    description:
      "Club de conversación en inglés en Tehuacán, Puebla. Grupos pequeños (máximo 6) que se reúnen cada domingo con un instructor estadounidense para practicar inglés real. Menos teoría, más conversación. Reserva tu lugar.",
    keywords: [
      "clases de inglés en Tehuacán",
      "inglés Tehuacán",
      "curso de inglés en Tehuacán",
      "conversación en inglés Tehuacán",
      "aprender inglés Tehuacán",
      "grupo de conversación en inglés",
      "practicar inglés hablando",
    ],
    metadataBase: new URL(BASE),
    alternates: {
      canonical: `${BASE}${pathname}`,
    },
    openGraph: {
      title: "Tu Tutor de Inglés — Club de conversación en Tehuacán",
      description:
        "Practica conversación en inglés en grupos pequeños con un instructor estadounidense. Cada domingo en Tehuacán. Menos teoría, más conversación.",
      url: "/",
      siteName: "Tu Tutor de Inglés",
      locale: "es_MX",
      type: "website",
      images: [
        {
          url: "/og-image",
          width: 1200,
          height: 630,
          alt: "Inglés en la Vida Real · Tehuacán",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Tu Tutor de Inglés — Club de conversación en Tehuacán",
      description:
        "Practica conversación en inglés en grupos pequeños con un instructor estadounidense. Cada domingo en Tehuacán.",
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
        <AnalyticsAndConsent />
      </body>
    </html>
  );
}
