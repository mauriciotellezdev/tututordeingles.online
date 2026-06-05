"use client";
import Link from "next/link";

const currentYear = new Date().getFullYear();

const links = {
  navegacion: [],
  cuenta: [],
  contacto: [
    { label: "Correo", href: "mailto:mauricio@tututordeingles.online" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0a1120] px-6 pt-16 pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              className="text-lg font-bold tracking-tight text-white"
            >
              Tu Tutor{" "}
              <span className="font-light text-blue-400">de Inglés</span>
            </Link>
            <p
              className="mt-4 max-w-[180px] text-xs leading-relaxed text-white/25"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Clases privadas de inglés para profesionales hispanohablantes.
            </p>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p
                className="mb-5 text-[9px] font-semibold tracking-[0.25em] text-white/20 uppercase"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </p>
              <ul className="space-y-3">
                {items.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-white/30 transition-colors duration-200 hover:text-white"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p
            className="text-[10px] text-white/15"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            © {currentYear} Tu Tutor de Inglés — Todos los derechos reservados.
          </p>
          <p
            className="text-[10px] text-white/15"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Pagos seguros con Stripe · WhatsApp
          </p>
        </div>
      </div>
    </footer>
  );
}
