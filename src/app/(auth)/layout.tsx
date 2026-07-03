import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
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

const BASE =
  process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") || "/";

  return {
    title: {
      default: "Tu Tutor de Inglés — Clases privadas 1 a 1",
      template: "%s | Tu Tutor de Inglés",
    },
    description:
      "Clases privadas de inglés para profesionales hispanohablantes.",
    metadataBase: new URL(BASE),
    alternates: {
      canonical: `${BASE}${pathname}`,
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
        className={`${plusJakarta.variable} bg-[#0f1729] text-white antialiased`}
      >
        <Header />
        {children}
        <Footer />
        <AnalyticsAndConsent />
      </body>
    </html>
  );
}
