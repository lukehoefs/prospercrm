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

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account book"
        title="Brands"
        description="Every apparel account on the book — model, tier, and health."
        actions={
          <Button size="sm" className="bg-cyan text-navy hover:bg-cyan/90">
            <Plus className="mr-1.5 size-3.5" />
            New brand
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
        <Input type="search" placeholder="Filter brands…" className="pl-8" />
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
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
              <TableRow key={b.id} className="cursor-pointer hover:bg-slate-50">
                <TableCell>
                  <Link href={`/leads/${b.id}`} className="block">
                    <p className="font-medium text-navy hover:text-cyan">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.domain}</p>
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{b.model}</TableCell>
                <TableCell>
                  <StatusBadge tone={tierTone(b.tier)}>{b.tier}</StatusBadge>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCompact(b.unitsYear)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{b.icp}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{b.health}</TableCell>
                <TableCell className="text-muted-foreground">{b.owner}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
