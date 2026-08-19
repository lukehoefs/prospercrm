import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, tierTone } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BRANDS } from '@/lib/data';
import { formatCompact } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function healthColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 65) return 'bg-cyan';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function HealthMeter({ score }: { score: number }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className={`h-full rounded-full ${healthColor(score)}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="w-6 text-right font-mono text-[12px] tabular-nums text-slate-700">{score}</span>
    </div>
  );
}

export default function BrandsPage() {
  const strategic = BRANDS.filter((b) => b.tier === 'Strategic').length;
  const active = BRANDS.filter((b) => b.tier === 'Active').length;
  const totalUnits = BRANDS.reduce((s, b) => s + b.unitsYear, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Account book"
        title="Brands"
        description="Every apparel account on the book — model, tier, and health."
        actions={
          <Button size="sm" className="h-8 bg-cyan text-navy hover:bg-cyan/90">
            <Plus className="mr-1.5 size-3.5" />
            New brand
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'On the book', value: String(BRANDS.length) },
          { label: 'Strategic', value: String(strategic) },
          { label: 'Active', value: String(active) },
          { label: 'Units / yr', value: formatCompact(totalUnits) },
        ].map((s) => (
          <div key={s.label} className="rounded border border-border bg-card px-3 py-2.5">
            <p className="text-[10px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
              {s.label}
            </p>
            <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-navy">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-2 border-b border-border bg-[#f7f9fb] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Filter brands…"
              className="h-8 border-slate-200 bg-white pl-8 text-[13px] shadow-none"
            />
          </div>
          <p className="text-[12px] text-slate-500">
            Showing{' '}
            <span className="font-mono tabular-nums font-medium text-slate-700">{BRANDS.length}</span>
          </p>
        </div>

        <Table className="data-table">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Brand</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Units / yr</TableHead>
              <TableHead className="text-right">ICP</TableHead>
              <TableHead className="text-right">Health</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {BRANDS.map((b) => (
              <TableRow key={b.id} className="group border-border">
                <TableCell>
                  <Link href={`/leads/${b.id}`} className="flex items-center gap-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded bg-navy text-[10px] font-semibold tracking-wide text-white">
                      {initials(b.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-navy group-hover:text-cyan">
                        {b.name}
                      </span>
                      <span className="block truncate text-[11px] text-slate-500">{b.domain}</span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-[13px] text-slate-600">{b.model}</TableCell>
                <TableCell>
                  <StatusBadge tone={tierTone(b.tier)}>{b.tier}</StatusBadge>
                </TableCell>
                <TableCell className="text-right font-mono text-[13px] tabular-nums text-slate-800">
                  {formatCompact(b.unitsYear)}
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex min-w-7 justify-end rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-slate-700">
                    {b.icp}
                  </span>
                </TableCell>
                <TableCell>
                  <HealthMeter score={b.health} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-slate-200 text-[9px] font-semibold text-slate-600">
                      {initials(b.owner)}
                    </span>
                    <span className="text-[13px] text-slate-600">{b.owner}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
