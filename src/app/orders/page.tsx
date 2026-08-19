import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, orderLabel, orderTone } from '@/components/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ORDERS } from '@/lib/data';
import { formatCompact, formatUsd } from '@/lib/utils';

export default function OrdersPage() {
  const inFlight = ORDERS.filter(
    (o) => o.status === 'processing' || o.status === 'production' || o.status === 'shipped',
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Floor"
        title="Orders"
        description="Accepted programs on the book — processing through delivery."
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-slate-50/80 px-3 py-2.5">
          <p className="text-xs text-slate-500">
            <span className="font-mono tabular-nums font-medium text-slate-700">{ORDERS.length}</span>{' '}
            orders ·{' '}
            <span className="font-mono tabular-nums font-medium text-slate-700">{inFlight}</span> in
            flight
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Order
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Brand
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-right text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Units
              </TableHead>
              <TableHead className="h-9 bg-slate-50/50 px-3 text-right text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Amount
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
            {ORDERS.map((o) => (
              <TableRow
                key={o.id}
                className="group border-border transition-colors hover:bg-cyan/[0.04]"
              >
                <TableCell className="px-3 py-3 font-mono text-sm font-medium text-navy">
                  {o.number}
                </TableCell>
                <TableCell className="px-3 py-3">
                  <Link
                    href={`/leads/${o.brandId}`}
                    className="text-sm font-medium text-navy group-hover:text-cyan"
                  >
                    {o.brandName}
                  </Link>
                </TableCell>
                <TableCell className="px-3 py-3 text-right font-mono text-sm tabular-nums text-slate-800">
                  {formatCompact(o.units)}
                </TableCell>
                <TableCell className="px-3 py-3 text-right font-mono text-sm font-semibold tabular-nums text-navy">
                  {formatUsd(o.amount)}
                </TableCell>
                <TableCell className="px-3 py-3">
                  <StatusBadge tone={orderTone(o.status)}>{orderLabel(o.status)}</StatusBadge>
                </TableCell>
                <TableCell className="px-3 py-3 text-sm text-slate-500">{o.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
