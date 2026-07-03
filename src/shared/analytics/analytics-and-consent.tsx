"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

// Analytics IDs are OPTIONAL (the site works without them), so we gate on
// presence rather than throwing — absence here is a valid state, not a bug.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const CONSENT_KEY = "tu_cookie_consent"; // "granted" | "denied"

type Consent = "granted" | "denied" | null;

export function AnalyticsAndConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
     
    try {
      const stored = localStorage.getItem(CONSENT_KEY) as Consent;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsent(stored === "granted" || stored === "denied" ? stored : null);
    } catch {
      /* localStorage unavailable */
    }
     
    setReady(true);
  }, []);

  const choose = (value: "granted" | "denied") => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
    setConsent(value);
  };

  const analyticsEnabled = consent === "granted" && (GA_ID || META_PIXEL_ID);

  return (
    <>
      {analyticsEnabled && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {analyticsEnabled && META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {/* Cookie consent banner — only until the user chooses. */}
      {ready && consent === null && (
        <div className="fixed inset-x-0 bottom-0 z-[200] px-4 pb-4">
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl border border-white/10 bg-[#0f1729]/95 p-5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-white/60">
              Usamos cookies para mantener tu sesión y, con tu permiso, medir el
              rendimiento del sitio y nuestra publicidad. Consulta el{" "}
              <Link
                href="/aviso-de-privacidad"
                className="text-blue-400 underline hover:text-blue-300"
              >
                Aviso de Privacidad
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => choose("denied")}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                Rechazar
              </button>
              <button
                onClick={() => choose("granted")}
                className="rounded-full bg-blue-500 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-400"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
