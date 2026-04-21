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
import { Plus, Search, ShoppingCart, Package } from 'lucide-react';
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    orderName: '',
    customerId: '',
    orderType: 'Screen Printing',
    quantity: 100,
    dueDate: '',
    status: 'Pending',
    artworkStatus: 'Pending',
    internalNotes: ''
  });

  useEffect(() => {
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qCustomers = query(collection(db, 'customers'), orderBy('companyName', 'asc'));
    const unsubCustomers = onSnapshot(qCustomers, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubOrders();
      unsubCustomers();
    };
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...formData,
        quantity: Number(formData.quantity),
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid,
      });

      // Automatically create production/fulfillment jobs based on order type
      if (formData.orderType === 'Screen Printing' || formData.orderType === 'Combined') {
        await addDoc(collection(db, 'productionJobs'), {
          orderId: orderRef.id,
          stage: 'Awaiting Approval',
          quantity: Number(formData.quantity),
          createdAt: new Date().toISOString(),
        });
      }

      if (formData.orderType === 'Fulfillment' || formData.orderType === 'Combined') {
        await addDoc(collection(db, 'fulfillmentJobs'), {
          orderId: orderRef.id,
          stage: 'Inventory Received',
          unitsReady: 0,
          createdAt: new Date().toISOString(),
        });
      }

      setIsDialogOpen(false);
      setFormData({
        orderName: '', customerId: '', orderType: 'Screen Printing',
        quantity: 100, dueDate: '', status: 'Pending', artworkStatus: 'Pending', internalNotes: ''
      });
    } catch (error) {
      console.error("Error adding order: ", error);
    }
  };

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.companyName || 'Unknown';
  };

  const filteredOrders = orders.filter(order => 
    order.orderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCustomerName(order.customerId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-dark-gray/60">Manage active production and fulfillment orders.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-dark-gray/50" />
              <Input 
                placeholder="Search orders..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-royal hover:bg-royal/90 text-white">
                  <Plus className="mr-2 h-4 w-4" /> New Order
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleCreateOrder}>
                  <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>
                      Create a new order. This will automatically generate the required production and fulfillment jobs.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Order Name / PO Number *</Label>
                      <Input required value={formData.orderName} onChange={e => setFormData({...formData, orderName: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Customer *</Label>
                        <Select value={formData.customerId} onValueChange={v => setFormData({...formData, customerId: v})} required>
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
                        <Label>Order Type</Label>
                        <Select value={formData.orderType} onValueChange={v => setFormData({...formData, orderType: v})}>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-royal text-white hover:bg-royal/90">Create Order</Button>
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
                <TableHead>Order Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody asChild>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-dark-gray/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-8 w-8 text-dark-gray/30" />
                        <p>No orders found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-light-gray/80" asChild>
                      <motion.tr variants={rowVariants}>
                        <TableCell className="font-medium text-lg">{order.orderName}</TableCell>
                        <TableCell className="font-semibold">{getCustomerName(order.customerId)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white">{order.orderType}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{order.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'Completed' ? 'success' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-dark-gray/80 font-medium">
                          {order.dueDate ? format(new Date(order.dueDate), 'MMM d, yyyy') : '-'}
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
