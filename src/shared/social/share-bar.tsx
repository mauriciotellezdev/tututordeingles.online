import type { ReactNode } from "react";
import { Link as LinkIcon, Share2 } from "lucide-react";

interface ShareBarProps {
  title: string;
  description: string;
  url: string;
  label: string;
  ctaLabel?: string;
}

function shareText(title: string, description: string) {
  return `${title} — ${description}`;
}

function buildShareLinks(url: string, title: string, description: string) {
  const text = encodeURIComponent(shareText(title, description));
  const encodedUrl = encodeURIComponent(url);

  return [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText(title, description)} ${url}`)}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];
}

export function ShareBar({ title, description, url, label, ctaLabel = "Share this page" }: ShareBarProps) {
  const links = buildShareLinks(url, title, description);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
          {label}
        </h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {links.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            <Share2 className="h-3.5 w-3.5 text-white/45" />
            {item.label}
          </a>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-white/45">
        <LinkIcon className="h-3.5 w-3.5" />
        {ctaLabel}
      </p>
    </div>
  );
}
