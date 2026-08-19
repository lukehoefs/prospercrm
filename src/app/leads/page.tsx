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
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${healthColor(score)}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="w-7 text-right font-mono text-xs tabular-nums text-slate-600">{score}</span>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <div className="space-y-5">
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

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border bg-slate-50/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Filter brands…"
              className="h-8 border-slate-200 bg-white pl-8 text-sm shadow-none"
            />
          </div>
          <p className="px-1 text-xs text-slate-500">
            <span className="font-mono tabular-nums font-medium text-slate-700">{BRANDS.length}</span>{' '}
            brands on the book
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Brand
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Model
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Tier
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-right text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Units / yr
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-right text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                ICP
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-right text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Health
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Owner
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {BRANDS.map((b) => (
              <TableRow
                key={b.id}
                className="group border-border transition-colors hover:bg-cyan/[0.04]"
              >
                <TableCell className="px-3 py-3">
                  <Link href={`/leads/${b.id}`} className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-navy text-[11px] font-semibold tracking-wide text-white">
                      {initials(b.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-navy group-hover:text-cyan">
                        {b.name}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{b.domain}</span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="px-3 py-3 text-sm text-slate-600">{b.model}</TableCell>
                <TableCell className="px-3 py-3">
                  <StatusBadge tone={tierTone(b.tier)}>{b.tier}</StatusBadge>
                </TableCell>
                <TableCell className="px-3 py-3 text-right font-mono text-sm tabular-nums text-slate-800">
                  {formatCompact(b.unitsYear)}
                </TableCell>
                <TableCell className="px-3 py-3 text-right">
                  <span className="inline-flex min-w-8 justify-end rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs tabular-nums text-slate-700">
                    {b.icp}
                  </span>
                </TableCell>
                <TableCell className="px-3 py-3">
                  <HealthMeter score={b.health} />
                </TableCell>
                <TableCell className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
                      {initials(b.owner)}
                    </span>
                    <span className="text-sm text-slate-600">{b.owner}</span>
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
