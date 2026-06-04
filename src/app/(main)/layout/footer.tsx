"use client";
import Link from "next/link"; 

const currentYear = new Date().getFullYear();

const links = {
  navegacion: [
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Tu tutor", href: "#tutor" },
    { label: "Precios", href: "#precios" },
    { label: "Blog", href: "/blog" },
  ],
  cuenta: [
    { label: "Registrarse", href: "/signup" },
    { label: "Entrar", href: "/login" },
  ],
  contacto: [
    { label: "Correo", href: "mailto:mauriciotellezdev@gmail.com" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0a1120] border-t border-white/[0.06] pt-16 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              className="text-white font-bold text-lg tracking-tight"
            >
              Tu Tutor{" "}
              <span className="text-blue-400 font-light">de Inglés</span>
            </Link>
            <p
              className="text-white/25 text-xs leading-relaxed mt-4 max-w-[180px]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Clases privadas de inglés para profesionales hispanohablantes.
            </p>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p
                className="text-white/20 text-[9px] tracking-[0.25em] uppercase mb-5 font-semibold"
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
                      className="text-white/30 hover:text-white text-xs font-medium transition-colors duration-200"
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

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-white/15 text-[10px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            © {currentYear} Tu Tutor de Inglés — Todos los derechos reservados.
          </p>
          <p
            className="text-white/15 text-[10px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Pagos seguros con Stripe · Google Meet
          </p>
        </div>
      </div>
    </footer>
  );
}
