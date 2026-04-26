import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-slate-500 mt-2">Create and manage customer quotes.</p>
        </div>
        <Button>Create Quote</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">QT-1024</TableCell>
                <TableCell>Acme Corp</TableCell>
                <TableCell>$5,400.00</TableCell>
                <TableCell>Sent</TableCell>
                <TableCell>Oct 24, 2023</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">QT-1023</TableCell>
                <TableCell>Globex Inc</TableCell>
                <TableCell>$2,100.00</TableCell>
                <TableCell>Accepted</TableCell>
                <TableCell>Oct 22, 2023</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
