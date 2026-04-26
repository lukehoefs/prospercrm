import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

export default function LeadsPage() {
  const leads = [
    { id: 1, name: 'Alice Smith', company: 'Acme Corp', status: 'New', email: 'alice@acme.com', date: 'Oct 24, 2023' },
    { id: 2, name: 'Bob Jones', company: 'Globex Inc', status: 'Contacted', email: 'bob@globex.com', date: 'Oct 23, 2023' },
    { id: 3, name: 'Charlie Brown', company: 'Soylent Corp', status: 'Qualified', email: 'charlie@soylent.com', date: 'Oct 21, 2023' },
    { id: 4, name: 'Diana Prince', company: 'Initech', status: 'Lost', email: 'diana@initech.com', date: 'Oct 19, 2023' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-slate-500 mt-2">Manage your prospective customers here.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input type="search" placeholder="Search leads..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                        'bg-slate-100 text-slate-800'
                      }
                    `}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell>{lead.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
