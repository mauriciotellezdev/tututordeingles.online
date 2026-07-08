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
    { label: "Próximas sesiones", href: "#calendario" },
    { label: "Preguntas", href: "#preguntas" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.07] bg-[#0f1729]/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-white/80">
            Tu Tutor <span className="font-light text-blue-400">de Inglés</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-8 md:flex"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/45 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div
          className="hidden items-center gap-3 md:flex"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <Link href="/join">
            <Button
              size="sm"
              className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:bg-blue-400"
            >
              Reserva tu lugar
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span
            className={`block h-px w-5 bg-white/60 transition-all duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-5 bg-white/60 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-px w-5 bg-white/60 transition-all duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          menuOpen ? "max-h-64 border-b border-white/[0.07]" : "max-h-0"
        } bg-[#0f1729]/95 backdrop-blur-md`}
      >
        <nav
          className="flex flex-col gap-5 px-6 py-6"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-white/50 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-2">
            <Link href="/join" onClick={() => setMenuOpen(false)}>
              <Button
                size="sm"
                className="w-fit rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-400"
              >
                Reserva tu lugar
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
