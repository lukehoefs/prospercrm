import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, quoteTone, quoteStaffLabel } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
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
    { label: 'Samples / follow-ups', value: String(TASKS.length), hint: 'On today’s list' },
  ];

  const stale = BRANDS.filter((b) => b.health < 70);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Floor feed"
        title="Command"
        description="Pipeline, samples in flight, and the work that moves a program."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/quotes">New quote</Link>
            </Button>
            <Button size="sm" className="bg-cyan text-navy hover:bg-cyan/90" asChild>
              <Link href="/leads">New brand</Link>
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card px-4 py-3 shadow-sm">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-navy">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Needs attention</h2>
            <Link href="/leads" className="text-xs font-medium text-muted-foreground hover:text-navy">
              All brands
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {stale.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/leads/${b.id}`}
                  className="flex items-start justify-between gap-3 py-2.5 hover:text-cyan"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.notes}</p>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {b.health}%
                  </span>
                </Link>
              </li>
            ))}
            {!stale.length && (
              <li className="py-6 text-sm text-muted-foreground">Pipeline is current.</li>
            )}
          </ul>
        </div>

        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <h2 className="section-title mb-3">Today on the book</h2>
          <ul className="space-y-1">
            {TASKS.map((t) => (
              <li key={t.id} className="flex items-start gap-2 py-1.5">
                <span className="mt-0.5 size-4 shrink-0 rounded-sm border border-border" />
                <div className="min-w-0">
                  <p className="text-sm">{t.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {t.due}
                    {t.brandName ? ` · ${t.brandName}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Quotes out</h2>
            <Link href="/quotes" className="text-xs font-medium text-muted-foreground hover:text-navy">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {QUOTES.filter((q) => q.status !== 'accepted' && q.status !== 'expired')
              .slice(0, 4)
              .map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{q.number}</p>
                    <p className="truncate text-xs text-muted-foreground">{q.brandName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs tabular-nums">
                      {formatUsd(q.units * q.unitPrice)}
                    </span>
                    <StatusBadge tone={quoteTone(q.status)}>{quoteStaffLabel(q.status)}</StatusBadge>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <h2 className="section-title mb-3">Recent activity</h2>
          <ul className="space-y-3">
            {ACTIVITIES.map((a) => (
              <li key={a.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-navy">{a.title}</p>
                  <time className="shrink-0 font-mono text-xs text-muted-foreground">{a.when}</time>
                </div>
                {a.body && <p className="mt-0.5 text-sm text-muted-foreground">{a.body}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
