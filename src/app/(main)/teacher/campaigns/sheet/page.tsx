"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { generateCampaignSheetAction, type SheetItem } from "../actions";
import { Printer, ArrowLeft } from "lucide-react";

export default function CampaignSheetPage() {
  const router = useRouter();
  const [items, setItems] = useState<SheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await generateCampaignSheetAction();
      setLoading(false);
      if (res.success) setItems(res.items);
      else {
        setError(res.error);
        if (res.error === "No autorizado.") router.push("/login");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .qr-card { break-inside: avoid; }
          @page { margin: 12mm; }
        }
      `}</style>

      {/* Toolbar (hidden when printing) */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white px-6 py-4">
        <Link href="/teacher/campaigns">
          <Button
            variant="ghost"
            className="flex items-center gap-1.5 rounded-full px-4 text-sm text-black/60 hover:bg-black/5"
          >
            <ArrowLeft className="size-4" /> Volver
          </Button>
        </Link>
        <p className="text-sm font-semibold text-black/70">
          Hoja de códigos QR — {items.length} activas
        </p>
        <Button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Printer className="size-4" /> Imprimir
        </Button>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <p className="no-print mb-6 text-sm text-black/50">
          Imprime esta hoja, recorta cada código y pégalo en combis, tiendas y
          bardas. Cada QR lleva a{" "}
          <span className="font-mono">/q/&lt;código&gt;</span> y registra los
          escaneos por separado.
        </p>

        {loading ? (
          <p className="py-16 text-center text-black/40">Generando códigos…</p>
        ) : error ? (
          <p className="py-16 text-center text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-black/40">
            No hay campañas activas. Crea algunas primero.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {items.map((it) => (
              <div
                key={it.code}
                className="qr-card flex flex-col items-center rounded-xl border border-black/15 p-4 text-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.dataUrl}
                  alt={`QR ${it.code}`}
                  className="w-full max-w-[180px]"
                />
                <p className="mt-3 text-base font-bold">{it.label}</p>
                <p className="font-mono text-xs text-black/60">/q/{it.code}</p>
                <p className="mt-1 text-[10px] tracking-wider text-black/40 uppercase">
                  {it.medium}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
