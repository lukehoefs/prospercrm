'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, ExternalLink, Users } from 'lucide-react';
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    mainContact: '',
    email: '',
    phone: '',
    shippingAddress: '',
    billingAddress: '',
    shopifyStore: '',
    pricingTier: 'Standard',
    notes: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(customersData);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'customers'), {
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid,
      });
      setIsDialogOpen(false);
      setFormData({
        companyName: '', mainContact: '', email: '', phone: '', shippingAddress: '',
        billingAddress: '', shopifyStore: '', pricingTier: 'Standard', notes: ''
      });
    } catch (error) {
      console.error("Error adding customer: ", error);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.mainContact?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-dark-gray/60">Manage active brands and clients.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-dark-gray/50" />
              <Input 
                placeholder="Search customers..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-royal hover:bg-royal/90 text-white">
                  <Plus className="mr-2 h-4 w-4" /> New Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleCreateCustomer}>
                  <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new customer account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input id="companyName" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mainContact">Main Contact</Label>
                        <Input id="mainContact" value={formData.mainContact} onChange={e => setFormData({...formData, mainContact: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopifyStore">Shopify Store URL</Label>
                      <Input id="shopifyStore" placeholder="https://store.myshopify.com" value={formData.shopifyStore} onChange={e => setFormData({...formData, shopifyStore: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress">Shipping Address</Label>
                      <Textarea id="shippingAddress" value={formData.shippingAddress} onChange={e => setFormData({...formData, shippingAddress: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-royal text-white hover:bg-royal/90">Save Customer</Button>
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
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Shopify</TableHead>
                <TableHead>Customer Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody asChild>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-dark-gray/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-8 w-8 text-dark-gray/30" />
                        <p>No customers found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="cursor-pointer hover:bg-light-gray/80" asChild>
                      <motion.tr variants={rowVariants}>
                        <TableCell className="font-medium text-lg">{customer.companyName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.mainContact || '-'}</span>
                            <span className="text-xs text-dark-gray/60">{customer.email}</span>
                            <span className="text-xs text-dark-gray/60">{customer.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white">{customer.pricingTier}</Badge>
                        </TableCell>
                        <TableCell>
                          {customer.shopifyStore ? (
                            <a href={customer.shopifyStore} target="_blank" rel="noreferrer" className="text-royal hover:underline flex items-center gap-1 text-sm">
                              Link <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-dark-gray/40 text-sm">Not linked</span>
                          )}
                        </TableCell>
                        <TableCell className="text-dark-gray/60 text-sm">
                          {customer.createdAt ? format(new Date(customer.createdAt), 'MMM d, yyyy') : '-'}
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
