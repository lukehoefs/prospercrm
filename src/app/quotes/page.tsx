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
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Receivables"
        title="Quotes"
        description="Line-item capacity. Human-reviewed. Never a guess."
        actions={
          <Button size="sm" className="bg-cyan text-navy hover:bg-cyan/90">
            <Plus className="mr-1.5 size-3.5" />
            New quote
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
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
                <TableRow key={q.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm">{q.number}</TableCell>
                  <TableCell>
                    <Link
                      href={`/leads/${q.brandId}`}
                      className="font-medium text-navy hover:text-cyan"
                    >
                      {q.brandName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{q.decoration}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatCompact(q.units)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatUsdExact(q.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums font-medium">
                    {formatUsd(total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={quoteTone(q.status)}>
                      {quoteStaffLabel(q.status)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{q.date}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
