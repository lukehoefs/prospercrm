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
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Floor"
        title="Orders"
        description="Accepted programs on the book — processing through delivery."
      />

      <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
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
              <TableRow key={o.id} className="hover:bg-slate-50">
                <TableCell className="font-mono text-sm">{o.number}</TableCell>
                <TableCell>
                  <Link
                    href={`/leads/${o.brandId}`}
                    className="font-medium text-navy hover:text-cyan"
                  >
                    {o.brandName}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCompact(o.units)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums font-medium">
                  {formatUsd(o.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={orderTone(o.status)}>{orderLabel(o.status)}</StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">{o.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
