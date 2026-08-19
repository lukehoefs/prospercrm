import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, quoteTone, quoteStaffLabel } from '@/components/status-badge';
import { ACTIVITIES, BRANDS, QUOTES, TASKS } from '@/lib/data';
import { formatCompact, formatUsd } from '@/lib/utils';

export default function CommandPage() {
  const openQuotes = QUOTES.filter((q) => q.status === 'sent' || q.status === 'viewed');
  const pipeline = QUOTES.reduce((sum, q) => sum + q.units * q.unitPrice, 0);
  const activeBrands = BRANDS.filter((b) => b.tier === 'Active' || b.tier === 'Strategic').length;
  const unitsQuoted = QUOTES.reduce((sum, q) => sum + q.units, 0);

  const stats = [
    { label: 'Open pipeline', value: formatUsd(pipeline), hint: `${openQuotes.length} quotes out` },
    { label: 'Units quoted', value: formatCompact(unitsQuoted), hint: 'Across live programs' },
    { label: 'Active brands', value: String(activeBrands), hint: `${BRANDS.length} on the book` },
    { label: 'Samples / follow-ups', value: String(TASKS.length), hint: "On today's list" },
  ];

  const stale = BRANDS.filter((b) => b.health < 70);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Floor feed"
        title="Command"
        description="Pipeline, samples in flight, and the work that moves a program."
        actions={
          <>
            <Link
              href="/quotes"
              className="inline-flex h-8 items-center rounded border border-border bg-card px-2.5 text-[12px] font-medium hover:bg-muted"
            >
              New quote
            </Link>
            <Link
              href="/leads"
              className="inline-flex h-8 items-center rounded bg-cyan px-2.5 text-[12px] font-semibold text-navy hover:bg-cyan/90"
            >
              New brand
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded border border-border bg-card px-3.5 py-3 shadow-sm">
            <p className="text-[10px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
              {s.label}
            </p>
            <p className="mt-1 font-mono text-[1.35rem] font-semibold tabular-nums text-navy">
              {s.value}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">{s.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <h2 className="section-title">Needs attention</h2>
            <Link href="/leads" className="text-[11px] font-medium text-slate-500 hover:text-navy">
              All brands
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {stale.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/leads/${b.id}`}
                  className="flex items-start justify-between gap-3 px-3.5 py-2.5 hover:bg-cyan/[0.04]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-navy">{b.name}</p>
                    <p className="text-[12px] text-slate-500">{b.notes}</p>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-slate-500">{b.health}%</span>
                </Link>
              </li>
            ))}
            {!stale.length && (
              <li className="px-3.5 py-6 text-[13px] text-slate-500">Pipeline is current.</li>
            )}
          </ul>
        </div>

        <div className="rounded border border-border bg-card shadow-sm">
          <div className="border-b border-border px-3.5 py-2.5">
            <h2 className="section-title">Today on the book</h2>
          </div>
          <ul className="divide-y divide-border">
            {TASKS.map((t) => (
              <li key={t.id} className="flex items-start gap-2.5 px-3.5 py-2.5">
                <span className="mt-0.5 size-3.5 shrink-0 rounded-sm border border-border" />
                <div className="min-w-0">
                  <p className="text-[13px] text-navy">{t.title}</p>
                  <p className="font-mono text-[11px] text-slate-500">
                    {t.due}
                    {t.brandName ? ` · ${t.brandName}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <h2 className="section-title">Quotes out</h2>
            <Link href="/quotes" className="text-[11px] font-medium text-slate-500 hover:text-navy">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {QUOTES.filter((q) => q.status !== 'accepted' && q.status !== 'expired')
              .slice(0, 4)
              .map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] font-medium text-navy">{q.number}</p>
                    <p className="truncate text-[12px] text-slate-500">{q.brandName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] tabular-nums text-slate-700">
                      {formatUsd(q.units * q.unitPrice)}
                    </span>
                    <StatusBadge tone={quoteTone(q.status)}>{quoteStaffLabel(q.status)}</StatusBadge>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        <div className="rounded border border-border bg-card shadow-sm">
          <div className="border-b border-border px-3.5 py-2.5">
            <h2 className="section-title">Recent activity</h2>
          </div>
          <ul className="divide-y divide-border">
            {ACTIVITIES.map((a) => (
              <li key={a.id} className="px-3.5 py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-semibold text-navy">{a.title}</p>
                  <time className="shrink-0 font-mono text-[11px] text-slate-500">{a.when}</time>
                </div>
                {a.body && <p className="mt-0.5 text-[12px] text-slate-500">{a.body}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
