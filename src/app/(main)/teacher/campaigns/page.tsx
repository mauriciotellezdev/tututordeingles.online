"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  listCampaignsAction,
  createCampaignAction,
  createCampaignsBulkAction,
  setCampaignActiveAction,
  updateCampaignAction,
  generateCampaignQrAction,
  getCampaignSignupsAction,
  type CampaignRow,
} from "./actions";
import type { CampaignSignupRow } from "@/lib/campaigns";
import {
  QrCode,
  Plus,
  Copy,
  Check,
  Download,
  ScanLine,
  UserPlus,
  ArrowLeft,
  Power,
  Printer,
  DollarSign,
  BadgeCheck,
  Layers,
  Users,
} from "lucide-react";

const MEDIA = [
  "combi",
  "flyer",
  "bulletin",
  "poster",
  "sticker",
  "store",
  "other",
];
const DEFAULT_TARGET = "/clases-de-ingles-en-tehuacan";

const inputClass =
  "w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [qr, setQr] = useState<{
    code: string;
    dataUrl: string;
    url: string;
  } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [signups, setSignups] = useState<Record<string, CampaignSignupRow[]>>(
    {}
  );

  // Single create form
  const [form, setForm] = useState({
    code: "",
    label: "",
    medium: "combi",
    target: DEFAULT_TARGET,
    permanent: false,
    fallbackCode: "",
    notes: "",
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk create
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkMedium, setBulkMedium] = useState("combi");
  const [bulkCreating, setBulkCreating] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    created: number;
    skipped: { line: string; reason: string }[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listCampaignsAction();
    setLoading(false);
    if (res.success) {
      setCampaigns(res.campaigns);
      setError(null);
    } else {
      setError(res.error);
      if (res.error === "No autorizado.") router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    const res = await createCampaignAction(form);
    setCreating(false);
    if (res.success) {
      setForm({
        code: "",
        label: "",
        medium: form.medium,
        target: DEFAULT_TARGET,
        permanent: false,
        fallbackCode: "",
        notes: "",
      });
      await load();
    } else {
      setFormError(res.error);
    }
  };

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkCreating(true);
    setBulkResult(null);
    const res = await createCampaignsBulkAction(bulkText, {
      medium: bulkMedium,
    });
    setBulkCreating(false);
    if (res.success) {
      setBulkResult({ created: res.created.length, skipped: res.skipped });
      setBulkText("");
      await load();
    } else {
      setBulkResult({ created: 0, skipped: [{ line: "", reason: res.error }] });
    }
  };

  const toggleActive = async (row: CampaignRow) => {
    await setCampaignActiveAction(row.code, !row.active);
    await load();
  };

  const copyUrl = async (url: string, code: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const showQr = async (code: string) => {
    const res = await generateCampaignQrAction(code);
    if (res.success) setQr({ code, dataUrl: res.dataUrl, url: res.url });
  };

  const toggleSignups = async (code: string) => {
    setEditing(null);
    if (viewing === code) {
      setViewing(null);
      return;
    }
    setViewing(code);
    if (!signups[code]) {
      const res = await getCampaignSignupsAction(code);
      if (res.success) setSignups((prev) => ({ ...prev, [code]: res.signups }));
    }
  };

  const totals = campaigns.reduce(
    (acc, c) => {
      acc.scans += c.scanCount;
      acc.signups += c.signupCount;
      acc.paid += c.paidCount;
      acc.revenue += c.revenuePesos;
      return acc;
    },
    { scans: 0, signups: 0, paid: 0, revenue: 0 }
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pt-24 pb-16 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
              <QrCode className="size-6 text-blue-400" /> Campañas{" "}
              <span className="text-blue-400">QR</span>
            </h1>
            <p className="mt-1 text-xs text-white/40">
              Rastrea qué anuncios (combis, flyers, tiendas) traen clientes que
              pagan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/teacher/campaigns/sheet">
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/5 hover:text-blue-300"
              >
                <Printer className="size-4" /> Hoja para imprimir
              </Button>
            </Link>
            <Link href="/teacher">
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="size-4" /> Panel
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/20 bg-destructive/10 text-destructive mb-6 rounded-xl p-4">
            <p className="text-sm font-semibold">{error}</p>
          </Card>
        )}

        {/* Summary */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <SummaryCard
            icon={<QrCode className="size-4 text-blue-400" />}
            label="Campañas"
            value={campaigns.length}
          />
          <SummaryCard
            icon={<ScanLine className="size-4 text-blue-400" />}
            label="Escaneos"
            value={totals.scans}
          />
          <SummaryCard
            icon={<UserPlus className="size-4 text-blue-400" />}
            label="Registros"
            value={totals.signups}
          />
          <SummaryCard
            icon={<BadgeCheck className="size-4 text-emerald-400" />}
            label="Pagan"
            value={totals.paid}
          />
          <SummaryCard
            icon={<DollarSign className="size-4 text-emerald-400" />}
            label="Ingresos"
            value={`$${totals.revenue.toLocaleString("es-MX")}`}
          />
        </div>

        {/* Create */}
        <Card className="mb-8 rounded-2xl border-white/[0.08] bg-[#0f1729]/40 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Plus className="size-5 text-blue-400" /> Nueva campaña
            </CardTitle>
            <CardDescription className="text-xs text-white/40">
              El QR apuntará a{" "}
              <span className="font-mono text-white/60">/q/&lt;código&gt;</span>
              . Códigos permanentes nunca se desactivan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreate}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <Field label="Código *">
                <input
                  className={inputClass}
                  placeholder="combi-01"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </Field>
              <Field label="Nombre">
                <input
                  className={inputClass}
                  placeholder="Combi ruta 3"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </Field>
              <Field label="Medio">
                <select
                  className={inputClass}
                  value={form.medium}
                  onChange={(e) => setForm({ ...form, medium: e.target.value })}
                >
                  {MEDIA.map((m) => (
                    <option key={m} value={m} className="bg-[#0f1729]">
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Destino">
                <input
                  className={inputClass}
                  placeholder={DEFAULT_TARGET}
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                />
              </Field>
              <Field label="Fallback (al desactivar)">
                <input
                  className={inputClass}
                  placeholder="otro-código (opcional)"
                  value={form.fallbackCode}
                  onChange={(e) =>
                    setForm({ ...form, fallbackCode: e.target.value })
                  }
                />
              </Field>
              <div className="flex items-end gap-4">
                <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-xs text-white/60 select-none">
                  <input
                    type="checkbox"
                    checked={form.permanent}
                    onChange={(e) =>
                      setForm({ ...form, permanent: e.target.checked })
                    }
                    className="size-4 accent-blue-500"
                  />
                  Permanente
                </label>
              </div>
              <div className="flex items-center justify-between gap-4 md:col-span-2">
                {formError ? (
                  <p className="text-xs text-red-400">{formError}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setBulkOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/40 hover:text-white"
                  >
                    <Layers className="size-3.5" />{" "}
                    {bulkOpen
                      ? "Ocultar creación en lote"
                      : "Crear varias a la vez"}
                  </button>
                )}
                <Button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
                >
                  {creating ? "Creando…" : "Crear campaña"}
                </Button>
              </div>
            </form>

            {bulkOpen && (
              <form
                onSubmit={handleBulk}
                className="mt-5 border-t border-white/[0.06] pt-5"
              >
                <p className="mb-2 text-[10px] tracking-wider text-white/40 uppercase">
                  Una por línea:{" "}
                  <span className="font-mono text-white/60">
                    código | nombre | medio
                  </span>{" "}
                  (nombre y medio opcionales)
                </p>
                <textarea
                  className={`${inputClass} h-28 font-mono`}
                  placeholder={
                    "combi-01 | Combi ruta 3 | combi\nflyer-oxxo-centro | Flyer OXXO centro | flyer\nbarda-norte"
                  }
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                />
                <div className="mt-3 flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-xs text-white/60">
                    Medio por defecto:
                    <select
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-xs"
                      value={bulkMedium}
                      onChange={(e) => setBulkMedium(e.target.value)}
                    >
                      {MEDIA.map((m) => (
                        <option key={m} value={m} className="bg-[#0f1729]">
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    type="submit"
                    disabled={bulkCreating || !bulkText.trim()}
                    className="rounded-full bg-white/10 px-5 py-2 text-xs font-semibold text-white hover:bg-white/20"
                  >
                    {bulkCreating ? "Creando…" : "Crear en lote"}
                  </Button>
                </div>
                {bulkResult && (
                  <div className="mt-3 text-xs">
                    <p className="font-semibold text-emerald-400">
                      {bulkResult.created} creadas
                    </p>
                    {bulkResult.skipped.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-white/40">
                        {bulkResult.skipped.map((s, i) => (
                          <li key={i}>
                            {s.line ? (
                              <span className="font-mono">{s.line}</span>
                            ) : null}{" "}
                            — {s.reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden rounded-2xl border-white/[0.08] bg-[#0f1729]/40 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">
              Rendimiento por campaña
            </CardTitle>
            <CardDescription className="text-xs text-white/40">
              La conversión es{" "}
              <span className="text-white/60">
                clientes que pagan ÷ escaneos
              </span>
              . Abre “registros” para ver quién llegó por cada código.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-sm text-white/40">
                Cargando…
              </p>
            ) : campaigns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.06] py-10 text-center">
                <QrCode className="mx-auto mb-3 size-8 text-white/15" />
                <p className="text-sm font-semibold text-white/70">
                  Aún no hay campañas
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Crea tu primer código arriba.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="border-b border-white/[0.06] bg-white/[0.02]">
                    <TableRow>
                      <Th>Campaña</Th>
                      <Th>Medio</Th>
                      <Th className="text-center">Escaneos</Th>
                      <Th className="text-center">Registros</Th>
                      <Th className="text-center">Pagan</Th>
                      <Th className="text-center">Ingresos</Th>
                      <Th className="text-center">Conv.</Th>
                      <Th>Estado</Th>
                      <Th>Acciones</Th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((c) => (
                      <React.Fragment key={c.code}>
                        <TableRow className="border-b border-white/[0.04] hover:bg-white/[0.01]">
                          <TableCell className="py-4">
                            <span className="block text-sm font-semibold text-white">
                              {c.label}
                            </span>
                            <button
                              onClick={() => copyUrl(c.scanUrl, c.code)}
                              className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-white/45 hover:text-white"
                              title="Copiar URL"
                            >
                              /q/{c.code}
                              {copied === c.code ? (
                                <Check className="size-3 text-emerald-400" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                            {c.permanent && (
                              <span className="ml-2 text-[9px] tracking-wider text-amber-400/80 uppercase">
                                permanente
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge className="rounded-full border border-white/10 bg-white/5 text-[9px] tracking-wider text-white/60 uppercase">
                              {c.medium}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <span className="font-bold text-white">
                              {c.scanCount}
                            </span>
                            <span className="mt-0.5 block text-[10px] text-white/35">
                              7d {c.scan7d} · 30d {c.scan30d}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-center font-bold text-white">
                            {c.signupCount}
                          </TableCell>
                          <TableCell className="py-4 text-center font-bold text-emerald-400">
                            {c.paidCount}
                          </TableCell>
                          <TableCell className="py-4 text-center font-bold text-emerald-400">
                            ${c.revenuePesos.toLocaleString("es-MX")}
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <span className="font-bold text-blue-400">
                              {(c.conversion * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            {c.active ? (
                              <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[9px] tracking-wider text-emerald-400 uppercase">
                                activa
                              </Badge>
                            ) : (
                              <Badge className="rounded-full border border-white/10 bg-white/5 text-[9px] tracking-wider text-white/40 uppercase">
                                retirada
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-1.5">
                              <IconBtn
                                title="QR"
                                onClick={() => showQr(c.code)}
                              >
                                <QrCode className="size-3.5" />
                              </IconBtn>
                              <IconBtn
                                title="Registros"
                                onClick={() => toggleSignups(c.code)}
                              >
                                <Users className="size-3.5" />
                              </IconBtn>
                              <IconBtn
                                title={c.active ? "Desactivar" : "Reactivar"}
                                onClick={() => toggleActive(c)}
                              >
                                <Power
                                  className={`size-3.5 ${c.active ? "text-red-400" : "text-emerald-400"}`}
                                />
                              </IconBtn>
                              <button
                                onClick={() => {
                                  setViewing(null);
                                  setEditing(
                                    editing === c.code ? null : c.code
                                  );
                                }}
                                className="px-1 text-[11px] text-white/45 hover:text-white"
                              >
                                editar
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {editing === c.code && (
                          <TableRow className="bg-white/[0.02]">
                            <TableCell colSpan={9} className="py-4">
                              <EditRow
                                row={c}
                                onSaved={async () => {
                                  setEditing(null);
                                  await load();
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )}

                        {viewing === c.code && (
                          <TableRow className="bg-white/[0.02]">
                            <TableCell colSpan={9} className="py-4">
                              <SignupList rows={signups[c.code]} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR modal */}
      {qr && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setQr(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1729] p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1 font-semibold text-white">{qr.code}</p>
            <p className="mb-4 font-mono text-xs break-all text-white/40">
              {qr.url}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr.dataUrl}
              alt={`QR ${qr.code}`}
              className="w-full rounded-xl bg-white p-3"
            />
            <div className="mt-4 flex gap-2">
              <a
                href={qr.dataUrl}
                download={`qr-${qr.code}.png`}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
              >
                <Download className="size-4" /> Descargar PNG
              </a>
              <Button
                variant="ghost"
                onClick={() => setQr(null)}
                className="rounded-full px-5 text-sm text-white/50 hover:bg-white/5 hover:text-white"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] tracking-wider text-white/40 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <Card className="rounded-2xl border-white/[0.08] bg-[#0f1729]/40 p-5">
      <div className="mb-2 flex items-center gap-2 text-[10px] tracking-wider text-white/40 uppercase">
        {icon} {label}
      </div>
      <p className="text-2xl font-extrabold text-white">{value}</p>
    </Card>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableHead
      className={`text-[10px] font-semibold tracking-wider text-white/40 uppercase ${className}`}
    >
      {children}
    </TableHead>
  );
}

function IconBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function SignupList({ rows }: { rows: CampaignSignupRow[] | undefined }) {
  if (rows === undefined)
    return <p className="text-xs text-white/40">Cargando registros…</p>;
  if (rows.length === 0)
    return (
      <p className="text-xs text-white/40">
        Aún no hay registros desde este código.
      </p>
    );
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div
          key={r.studentId + r.email}
          className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-xs"
        >
          <div>
            <span className="font-semibold text-white">{r.name}</span>
            <span className="ml-2 text-white/40">{r.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/30">
              {new Date(r.createdAt).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
              })}
            </span>
            {r.paid ? (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-400">
                pagó ${Math.round(r.revenueCents / 100).toLocaleString("es-MX")}
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/40">
                sin pago
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function EditRow({ row, onSaved }: { row: CampaignRow; onSaved: () => void }) {
  const [target, setTarget] = useState(row.target);
  const [fallbackCode, setFallbackCode] = useState(row.fallbackCode ?? "");
  const [label, setLabel] = useState(row.label);
  const [permanent, setPermanent] = useState(row.permanent);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setErr(null);
    const res = await updateCampaignAction(row.code, {
      target,
      fallbackCode: fallbackCode || null,
      label,
      permanent,
    });
    setSaving(false);
    if (res.success) onSaved();
    else setErr(res.error);
  };

  return (
    <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-4">
      <div>
        <label className="mb-1 block text-[10px] tracking-wider text-white/40 uppercase">
          Nombre
        </label>
        <input
          className={inputClass}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] tracking-wider text-white/40 uppercase">
          Destino
        </label>
        <input
          className={inputClass}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] tracking-wider text-white/40 uppercase">
          Fallback
        </label>
        <input
          className={inputClass}
          value={fallbackCode}
          onChange={(e) => setFallbackCode(e.target.value)}
          placeholder="otro-código"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-white/60 select-none">
          <input
            type="checkbox"
            checked={permanent}
            onChange={(e) => setPermanent(e.target.checked)}
            className="size-4 accent-blue-500"
          />
          Permanente
        </label>
        <Button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-blue-500 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-400"
        >
          {saving ? "…" : "Guardar"}
        </Button>
      </div>
      {err && <p className="text-xs text-red-400 md:col-span-4">{err}</p>}
    </div>
  );
}
