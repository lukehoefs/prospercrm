'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Printer, Users, FileText, ArrowRight, Calculator, ShoppingCart, TrendingUp } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Jan', revenue: 4000, leads: 24 },
  { name: 'Feb', revenue: 3000, leads: 13 },
  { name: 'Mar', revenue: 2000, leads: 98 },
  { name: 'Apr', revenue: 2780, leads: 39 },
  { name: 'May', revenue: 1890, leads: 48 },
  { name: 'Jun', revenue: 2390, leads: 38 },
  { name: 'Jul', revenue: 3490, leads: 43 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Home() {
  const { user, loading, login } = useAuth();
  
  const [stats, setStats] = useState({
    activeLeads: 0,
    openQuotes: 0,
    productionJobs: 0,
    fulfillmentQueue: 0
  });

  useEffect(() => {
    if (!user) return;

    // Active Leads (Not Closed)
    const qLeads = query(collection(db, 'leads'), where('stage', 'not-in', ['Closed Won', 'Closed Lost']));
    const unsubLeads = onSnapshot(qLeads, (snap) => {
      setStats(s => ({ ...s, activeLeads: snap.size }));
    });

    // Open Quotes (Draft or Sent)
    const qQuotes = query(collection(db, 'quotes'), where('status', 'in', ['Draft', 'Sent']));
    const unsubQuotes = onSnapshot(qQuotes, (snap) => {
      setStats(s => ({ ...s, openQuotes: snap.size }));
    });

    // Active Production Jobs (Not Completed)
    const qProd = query(collection(db, 'productionJobs'), where('stage', '!=', 'Completed'));
    const unsubProd = onSnapshot(qProd, (snap) => {
      setStats(s => ({ ...s, productionJobs: snap.size }));
    });

    // Active Fulfillment Jobs (Not Completed)
    const qFulfill = query(collection(db, 'fulfillmentJobs'), where('stage', '!=', 'Completed'));
    const unsubFulfill = onSnapshot(qFulfill, (snap) => {
      setStats(s => ({ ...s, fulfillmentQueue: snap.size }));
    });

    return () => {
      unsubLeads();
      unsubQuotes();
      unsubProd();
      unsubFulfill();
    };
  }, [user]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-light-gray text-dark-gray">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-md px-4 relative z-10"
        >
          <div className="w-20 h-20 bg-royal rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-royal/20">
            <Printer className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">PROSPER<span className="text-royal">OS</span></h1>
          <p className="text-white/70 mb-8 text-lg">The intelligent, operator-grade platform for screen printing and fulfillment.</p>
          <Button size="lg" onClick={login} className="w-full bg-royal hover:bg-royal/90 text-white font-bold h-14 text-lg shadow-xl shadow-royal/20 transition-all hover:scale-[1.02]">
            Sign In with Google
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <AppLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy">Dashboard</h1>
            <p className="text-dark-gray/60">Overview of operations and sales.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-dark-gray/10 shadow-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-dark-gray">Revenue +14% this month</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-royal">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
              <div className="h-8 w-8 rounded-full bg-royal/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-royal" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.activeLeads}</div>
              <p className="text-xs text-dark-gray/60 mt-1">Awaiting follow-up</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Quotes</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.openQuotes}</div>
              <p className="text-xs text-dark-gray/60 mt-1">Pending approval</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Production Jobs</CardTitle>
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Printer className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.productionJobs}</div>
              <p className="text-xs text-dark-gray/60 mt-1">In progress</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fulfillment Queue</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.fulfillmentQueue}</div>
              <p className="text-xs text-dark-gray/60 mt-1">Ready to pick</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and lead generation trends.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E5BFF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1E5BFF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0B1F3A', fontWeight: 500 }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#1E5BFF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Link href="/quotes">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-royal hover:text-royal transition-all hover:shadow-md bg-white">
                    <Calculator className="h-5 w-5" />
                    <span className="text-xs font-medium">New Quote</span>
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-royal hover:text-royal transition-all hover:shadow-md bg-white">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-xs font-medium">New Order</span>
                  </Button>
                </Link>
                <Link href="/leads">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-royal hover:text-royal transition-all hover:shadow-md bg-white">
                    <Users className="h-5 w-5" />
                    <span className="text-xs font-medium">Add Lead</span>
                  </Button>
                </Link>
                <Link href="/production">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-royal hover:text-royal transition-all hover:shadow-md bg-white">
                    <Printer className="h-5 w-5" />
                    <span className="text-xs font-medium">View Floor</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-navy text-white border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-royal rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="font-medium text-white/90 text-sm">API Connections</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">Online</Badge>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="font-medium text-white/90 text-sm">Shopify Sync</span>
                  <span className="text-xs text-white/50">2m ago</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="font-medium text-white/90 text-sm">Shipping Carriers</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">Online</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
