import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RecordSection, RecordShell } from '@/components/record-shell';
import {
  StatusBadge,
  leadLabel,
  leadTone,
  orderLabel,
  orderTone,
  quoteStaffLabel,
  quoteTone,
  tierTone,
} from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  activitiesForBrand,
  getBrand,
  ordersForBrand,
  peopleForBrand,
  quotesForBrand,
} from '@/lib/data';
import { formatCompact, formatUsd, formatUsdExact } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default async function BrandRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = getBrand(id);
  if (!brand) notFound();

  const people = peopleForBrand(id);
  const quotes = quotesForBrand(id);
  const orders = ordersForBrand(id);
  const activities = activitiesForBrand(id);

  return (
    <RecordShell
      header={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/leads"
              className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-navy"
            >
              <ArrowLeft className="size-3.5" />
              Brands
            </Link>
            <p className="eyebrow">{brand.domain}</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">{brand.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {brand.industry} · {brand.location}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge tone={tierTone(brand.tier)}>{brand.tier}</StatusBadge>
              <StatusBadge tone="neutral">{brand.model}</StatusBadge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              New program
            </Button>
            <Button size="sm" className="bg-cyan text-navy hover:bg-cyan/90">
              New quote
            </Button>
          </div>
        </div>
      }
      about={
        <>
          <RecordSection title="About">
            <p className="text-sm text-muted-foreground">{brand.notes}</p>
          </RecordSection>
          <RecordSection title="Properties">
            <dl className="space-y-2.5 text-sm">
              <Row k="Owner" v={brand.owner} />
              <Row k="Location" v={brand.location} />
              <Row k="Units / yr" v={formatCompact(brand.unitsYear)} />
              <Row k="Domain" v={brand.domain} />
            </dl>
          </RecordSection>
          <RecordSection title="Scores">
            <Score label="ICP fit" value={brand.icp} />
            <Score label="Health" value={brand.health} />
          </RecordSection>
        </>
      }
      activity={
        <>
          <RecordSection title="Log activity">
            <Textarea placeholder="Note, call outcome, sample update…" className="min-h-20" />
            <div className="mt-2 flex justify-end">
              <Button size="sm">Post</Button>
            </div>
          </RecordSection>
          <RecordSection title="Timeline">
            <ol className="space-y-3">
              {activities.map((a) => (
                <li key={a.id} className="rounded-md border border-border bg-card p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-navy">{a.title}</p>
                    <time className="font-mono text-xs text-muted-foreground">{a.when}</time>
                  </div>
                  {a.body && <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>}
                  <p className="mt-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {a.kind}
                  </p>
                </li>
              ))}
              {!activities.length && (
                <li className="py-8 text-center text-sm text-muted-foreground">No activity yet.</li>
              )}
            </ol>
          </RecordSection>
        </>
      }
      related={
        <>
          <RecordSection title="People">
            <ul className="space-y-2">
              {people.map((p) => (
                <li key={p.id} className="rounded-md border border-border px-2.5 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.title}</p>
                    </div>
                    <StatusBadge tone={leadTone(p.status)}>{leadLabel(p.status)}</StatusBadge>
                  </div>
                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                    {p.email}
                  </p>
                </li>
              ))}
              {!people.length && (
                <li className="text-sm text-muted-foreground">No people linked.</li>
              )}
            </ul>
          </RecordSection>
          <RecordSection title="Quotes">
            <ul className="space-y-2">
              {quotes.map((q) => (
                <li
                  key={q.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{q.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCompact(q.units)} × {formatUsdExact(q.unitPrice)}
                    </p>
                  </div>
                  <StatusBadge tone={quoteTone(q.status)}>{quoteStaffLabel(q.status)}</StatusBadge>
                </li>
              ))}
              {!quotes.length && <li className="text-sm text-muted-foreground">No quotes.</li>}
            </ul>
          </RecordSection>
          <RecordSection title="Orders">
            <ul className="space-y-2">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{o.number}</p>
                    <p className="text-xs text-muted-foreground">{formatUsd(o.amount)}</p>
                  </div>
                  <StatusBadge tone={orderTone(o.status)}>{orderLabel(o.status)}</StatusBadge>
                </li>
              ))}
              {!orders.length && <li className="text-sm text-muted-foreground">No orders.</li>}
            </ul>
          </RecordSection>
        </>
      }
    />
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-cyan" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
