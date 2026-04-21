'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Calculator, FileText } from 'lucide-react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { format } from 'date-fns';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Quote Engine State
  const [quoteType, setQuoteType] = useState('Screen Printing');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  // Screen Printing Inputs
  const [spQuantity, setSpQuantity] = useState(100);
  const [spBlankCost, setSpBlankCost] = useState(5.00);
  const [spLocations, setSpLocations] = useState(1);
  const [spColors, setSpColors] = useState(1);
  
  // Fulfillment Inputs
  const [fVolume, setFVolume] = useState(500);
  const [fStorage, setFStorage] = useState(2); // pallets

  useEffect(() => {
    const qQuotes = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const unsubQuotes = onSnapshot(qQuotes, (snapshot) => {
      setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qCustomers = query(collection(db, 'customers'), orderBy('companyName', 'asc'));
    const unsubCustomers = onSnapshot(qCustomers, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubQuotes();
      unsubCustomers();
    };
  }, []);

  // Simple Pricing Logic (Admin editable in a real scenario)
  const calculatePricing = () => {
    let total = 0;
    let units = 1;

    if (quoteType === 'Screen Printing' || quoteType === 'Combined') {
      const printCost = (spLocations * 0.50) + (spColors * 0.25);
      const markup = 1.4; // 40% markup on blanks
      const spTotal = spQuantity * ((spBlankCost * markup) + printCost);
      total += spTotal;
      units = spQuantity;
    }

    if (quoteType === 'Fulfillment' || quoteType === 'Combined') {
      const pickPackCost = fVolume * 2.50; // $2.50 per order
      const storageCost = fStorage * 40.00; // $40 per pallet
      const fTotal = pickPackCost + storageCost;
      total += fTotal;
      if (quoteType === 'Fulfillment') units = fVolume;
    }

    return {
      total,
      perUnit: total / (units || 1)
    };
  };

  const { total: calculatedTotal, perUnit: calculatedPerUnit } = calculatePricing();

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'quotes'), {
        customerId: selectedCustomer,
        quoteType,
        status: 'Draft',
        totalPrice: calculatedTotal,
        costPerUnit: calculatedPerUnit,
        details: JSON.stringify({
          spQuantity, spBlankCost, spLocations, spColors, fVolume, fStorage
        }),
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding quote: ", error);
    }
  };

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.companyName || 'Unknown';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
            <p className="text-dark-gray/60">Generate and manage pricing for clients.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-dark-gray/50" />
              <Input 
                placeholder="Search quotes..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-royal hover:bg-royal/90 text-white">
                  <Calculator className="mr-2 h-4 w-4" /> New Quote
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleCreateQuote}>
                  <DialogHeader>
                    <DialogTitle>Quote Engine</DialogTitle>
                    <DialogDescription>
                      Generate instant pricing for production and fulfillment.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Customer</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quote Type</Label>
                        <Select value={quoteType} onValueChange={setQuoteType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Screen Printing">Screen Printing</SelectItem>
                            <SelectItem value="Fulfillment">Fulfillment</SelectItem>
                            <SelectItem value="Combined">Combined</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-light-gray p-4 rounded-lg border border-dark-gray/10 space-y-4">
                      {(quoteType === 'Screen Printing' || quoteType === 'Combined') && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-sm uppercase tracking-wider text-navy">Screen Printing Variables</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Quantity</Label>
                              <Input type="number" value={spQuantity} onChange={e => setSpQuantity(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                              <Label>Blank Cost ($)</Label>
                              <Input type="number" step="0.01" value={spBlankCost} onChange={e => setSpBlankCost(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                              <Label>Locations</Label>
                              <Input type="number" value={spLocations} onChange={e => setSpLocations(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                              <Label>Colors</Label>
                              <Input type="number" value={spColors} onChange={e => setSpColors(Number(e.target.value))} />
                            </div>
                          </div>
                        </div>
                      )}

                      {(quoteType === 'Fulfillment' || quoteType === 'Combined') && (
                        <div className="space-y-4 pt-2">
                          <h4 className="font-semibold text-sm uppercase tracking-wider text-navy">Fulfillment Variables</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Monthly Order Volume</Label>
                              <Input type="number" value={fVolume} onChange={e => setFVolume(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                              <Label>Storage Pallets</Label>
                              <Input type="number" value={fStorage} onChange={e => setFStorage(Number(e.target.value))} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-navy text-white p-6 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="text-sm text-white/70 uppercase tracking-wider font-semibold">Estimated Total</div>
                        <div className="text-4xl font-bold">${calculatedTotal.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/70 uppercase tracking-wider font-semibold">Per Unit</div>
                        <div className="text-2xl font-semibold">${calculatedPerUnit.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-royal text-white hover:bg-royal/90">Save Quote</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody asChild>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-dark-gray/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="h-8 w-8 text-dark-gray/30" />
                        <p>No quotes generated yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((quote) => (
                    <TableRow key={quote.id} className="cursor-pointer hover:bg-light-gray/80" asChild>
                      <motion.tr variants={rowVariants}>
                        <TableCell className="font-medium">{getCustomerName(quote.customerId)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white">{quote.quoteType}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-lg">
                          ${quote.totalPrice?.toFixed(2)}
                          <span className="text-xs font-normal text-dark-gray/50 ml-2">(${quote.costPerUnit?.toFixed(2)}/ea)</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={quote.status === 'Approved' ? 'success' : quote.status === 'Draft' ? 'secondary' : 'default'}>
                            {quote.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-dark-gray/60 text-sm">
                          {quote.createdAt ? format(new Date(quote.createdAt), 'MMM d, yyyy') : '-'}
                        </TableCell>
                      </motion.tr>
                    </TableRow>
                  ))
                )}
              </motion.tbody>
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}
