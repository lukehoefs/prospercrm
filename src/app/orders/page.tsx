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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function OrdersPage() {
  const inFlight = ORDERS.filter(
    (o) => o.status === 'processing' || o.status === 'production' || o.status === 'shipped',
  ).length;
  const delivered = ORDERS.filter((o) => o.status === 'delivered').length;
  const totalUnits = ORDERS.reduce((s, o) => s + o.units, 0);
  const totalAmount = ORDERS.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        eyebrow="Floor"
        title="Orders"
        description="Accepted programs on the book — processing through delivery."
      />

      <div className="kpi-strip">
        <div>
          <p className="kpi-label">Orders</p>
          <p className="kpi-value">{ORDERS.length}</p>
        </div>
        <div>
          <p className="kpi-label">In flight</p>
          <p className="kpi-value">{inFlight}</p>
        </div>
        <div>
          <p className="kpi-label">Delivered</p>
          <p className="kpi-value">{delivered}</p>
        </div>
        <div>
          <p className="kpi-label">Booked</p>
          <p className="kpi-value">{formatUsd(totalAmount)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-[#f4f7fa] px-3 py-2">
          <p className="text-[12px] text-slate-500">
            <span className="font-mono tabular-nums font-medium text-slate-700">{ORDERS.length}</span>{' '}
            orders ·{' '}
            <span className="font-mono tabular-nums font-medium text-slate-700">{inFlight}</span> in
            flight ·{' '}
            <span className="font-mono tabular-nums font-medium text-slate-700">
              {formatCompact(totalUnits)}
            </span>{' '}
            units
          </p>
        </div>

        <Table className="data-table">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Order</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ORDERS.map((o) => (
              <TableRow key={o.id} className="group border-border">
                <TableCell className="font-mono text-[13px] font-medium text-navy">
                  {o.number}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/leads/${o.brandId}`}
                    className="flex items-center gap-2 text-[13px] font-semibold text-navy group-hover:text-cyan"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded bg-navy text-[9px] font-semibold text-white">
                      {initials(o.brandName)}
                    </span>
                    {o.brandName}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono text-[13px] tabular-nums text-slate-800">
                  {formatCompact(o.units)}
                </TableCell>
                <TableCell className="text-right font-mono text-[13px] font-semibold tabular-nums text-navy">
                  {formatUsd(o.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={orderTone(o.status)}>{orderLabel(o.status)}</StatusBadge>
                </TableCell>
                <TableCell className="text-[13px] text-slate-500">{o.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
