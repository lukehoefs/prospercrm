import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
  info: "bg-sky-50 text-sky-800 border-sky-200",
  warn: "bg-amber-50 text-amber-900 border-amber-200",
  good: "bg-emerald-50 text-emerald-800 border-emerald-200",
  bad: "bg-red-50 text-red-800 border-red-200",
  brand: "bg-cyan-50 text-cyan-900 border-cyan-200",
} as const;

export type Tone = keyof typeof TONES;

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function leadTone(status: string): Tone {
  if (status === "active" || status === "qualified") return "good";
  if (status === "contacted") return "warn";
  if (status === "new") return "info";
  if (status === "lost") return "neutral";
  return "neutral";
}

export function quoteTone(status: string): Tone {
  if (status === "accepted") return "good";
  if (status === "viewed") return "warn";
  if (status === "sent") return "info";
  if (status === "expired") return "bad";
  return "neutral";
}

export function orderTone(status: string): Tone {
  if (status === "delivered") return "good";
  if (status === "shipped") return "info";
  if (status === "production") return "warn";
  return "neutral";
}

export function tierTone(tier: string): Tone {
  if (tier === "Strategic") return "brand";
  if (tier === "Active") return "good";
  if (tier === "Prospect") return "info";
  return "neutral";
}

export function quoteStaffLabel(status: string) {
  const map: Record<string, string> = {
    draft: "Draft",
    sent: "Sent",
    viewed: "Viewed",
    accepted: "Accepted",
    expired: "Expired",
  };
  return map[status] ?? status;
}

export function leadLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function orderLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
