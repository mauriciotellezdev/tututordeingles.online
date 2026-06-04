"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Tu tutor", href: "#tutor" },
    { label: "Precios", href: "#precios" },
    { label: "Entrevistas", href: "/ingles-para-entrevistas-de-trabajo" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0f1729]/90 backdrop-blur-md border-b border-white/[0.07]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <span className="text-white font-bold text-lg tracking-tight group-hover:text-white/80 transition-colors">
            Tu Tutor{" "}
            <span className="text-blue-400 font-light">de Inglés</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-8"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/45 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div
          className="hidden md:flex items-center gap-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <Link
            href="/login"
            className="text-white/45 hover:text-white text-sm font-medium transition-colors duration-200 px-2"
          >
            Entrar
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/20"
            >
              Regístrate
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span className={`block w-5 h-px bg-white/60 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-5 h-px bg-white/60 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-white/60 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-64 border-b border-white/[0.07]" : "max-h-0"
        } bg-[#0f1729]/95 backdrop-blur-md`}
      >
        <nav
          className="flex flex-col px-6 py-6 gap-5"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-white/[0.07]">
            <Link href="/login" className="text-white/40 text-sm font-medium">
              Entrar
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-5 py-2 text-sm font-semibold w-fit shadow-lg shadow-blue-500/20"
              >
                Regístrate
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
