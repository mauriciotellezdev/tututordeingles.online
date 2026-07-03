import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Shared shell for legal pages (aviso de privacidad, términos, reembolsos).
 * Dark-themed readable prose consistent with the rest of the site.
 */
export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pt-28 pb-20 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Inicio
        </Link>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-xs text-white/40">
          Última actualización: {updated}
        </p>
        <div className="legal-prose mt-10 space-y-6 text-sm leading-relaxed text-white/70">
          {children}
        </div>
      </div>
    </main>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-white">{heading}</h2>
      {children}
    </section>
  );
}
