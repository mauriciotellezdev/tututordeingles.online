import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

import Header from "./layout/header";
import Footer from "./layout/footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tu Tutor de Inglés — Clases privadas 1 a 1",
  description:
    "Clases privadas de inglés para profesionales hispanohablantes. Aprende inglés real con un tutor nativo 1 a 1.",
};

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
      </body>
    </html>
  );
}
