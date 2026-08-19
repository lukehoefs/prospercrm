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

export default function QuotesPage() {
  const open = QUOTES.filter((q) => q.status === 'sent' || q.status === 'viewed').length;

  return (
    <div className="space-y-5">
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

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-slate-50/80 px-3 py-2.5">
          <p className="text-xs text-slate-500">
            <span className="font-mono tabular-nums font-medium text-slate-700">{QUOTES.length}</span>{' '}
            quotes ·{' '}
            <span className="font-mono tabular-nums font-medium text-slate-700">{open}</span> open
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Number
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Brand
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Decoration
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-right text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Units
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-right text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Unit
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-right text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Total
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Status
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {QUOTES.map((q) => {
              const total = q.units * q.unitPrice;
              return (
                <TableRow
                  key={q.id}
                  className="group border-border transition-colors hover:bg-cyan/[0.04]"
                >
                  <TableCell className="px-3 py-3 font-mono text-sm font-medium text-navy">
                    {q.number}
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Link
                      href={`/leads/${q.brandId}`}
                      className="text-sm font-medium text-navy group-hover:text-cyan"
                    >
                      {q.brandName}
                    </Link>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm text-slate-600">{q.decoration}</TableCell>
                  <TableCell className="px-3 py-3 text-right font-mono text-sm tabular-nums text-slate-800">
                    {formatCompact(q.units)}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right font-mono text-sm tabular-nums text-slate-600">
                    {formatUsdExact(q.unitPrice)}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right font-mono text-sm font-semibold tabular-nums text-navy">
                    {formatUsd(total)}
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <StatusBadge tone={quoteTone(q.status)}>
                      {quoteStaffLabel(q.status)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm text-slate-500">{q.date}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
