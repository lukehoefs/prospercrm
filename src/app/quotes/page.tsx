import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, quoteStaffLabel, quoteTone } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { QUOTES } from '@/lib/data';
import { formatCompact, formatUsd, formatUsdExact } from '@/lib/utils';
import { Plus } from 'lucide-react';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function QuotesPage() {
  const open = QUOTES.filter((q) => q.status === 'sent' || q.status === 'viewed').length;
  const pipeline = QUOTES.filter((q) => q.status === 'sent' || q.status === 'viewed').reduce(
    (s, q) => s + q.units * q.unitPrice,
    0,
  );
  const accepted = QUOTES.filter((q) => q.status === 'accepted').length;

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        eyebrow="Receivables"
        title="Quotes"
        description="Line-item capacity. Human-reviewed. Never a guess."
        actions={
          <Button size="sm" className="h-8 bg-cyan text-navy hover:bg-cyan/90">
            <Plus className="mr-1.5 size-3.5" />
            New quote
          </Button>
        }
      />

      <div className="kpi-strip">
        <div>
          <p className="kpi-label">Total quotes</p>
          <p className="kpi-value">{QUOTES.length}</p>
        </div>
        <div>
          <p className="kpi-label">Open</p>
          <p className="kpi-value">{open}</p>
        </div>
        <div>
          <p className="kpi-label">Accepted</p>
          <p className="kpi-value">{accepted}</p>
        </div>
        <div>
          <p className="kpi-label">Open pipeline</p>
          <p className="kpi-value">{formatUsd(pipeline)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-[#f4f7fa] px-3 py-2">
          <p className="text-[12px] text-slate-500">
            <span className="font-mono tabular-nums font-medium text-slate-700">{QUOTES.length}</span>{' '}
            quotes ·{' '}
            <span className="font-mono tabular-nums font-medium text-slate-700">{open}</span> open
          </p>
        </div>

        <Table className="data-table">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Number</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Decoration</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Unit</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {QUOTES.map((q) => {
              const total = q.units * q.unitPrice;
              return (
                <TableRow key={q.id} className="group border-border">
                  <TableCell className="font-mono text-[13px] font-medium text-navy">
                    {q.number}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/leads/${q.brandId}`}
                      className="flex items-center gap-2 text-[13px] font-semibold text-navy group-hover:text-cyan"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded bg-navy text-[9px] font-semibold text-white">
                        {initials(q.brandName)}
                      </span>
                      {q.brandName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[13px] text-slate-600">{q.decoration}</TableCell>
                  <TableCell className="text-right font-mono text-[13px] tabular-nums text-slate-800">
                    {formatCompact(q.units)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px] tabular-nums text-slate-600">
                    {formatUsdExact(q.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px] font-semibold tabular-nums text-navy">
                    {formatUsd(total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={quoteTone(q.status)}>
                      {quoteStaffLabel(q.status)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-[13px] text-slate-500">{q.date}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
