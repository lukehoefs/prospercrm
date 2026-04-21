'use client';

import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function AdminPage() {
  const { profile } = useAuth();

  if (profile?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy mb-2">Access Denied</h2>
            <p className="text-dark-gray/60">You do not have permission to view this page.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-dark-gray/60">Manage system rules, pricing logic, and users.</p>
        </div>

        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pricing">Pricing Logic</TabsTrigger>
            <TabsTrigger value="workflow">Workflow Statuses</TabsTrigger>
            <TabsTrigger value="users">User Roles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pricing">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quote Engine Variables</CardTitle>
                <CardDescription>Adjust the base costs and markups used in the quote engine.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-navy border-b pb-2">Screen Printing</h3>
                    <div className="space-y-2">
                      <Label>Blank Garment Markup (%)</Label>
                      <Input type="number" defaultValue={40} />
                    </div>
                    <div className="space-y-2">
                      <Label>Base Cost per Location ($)</Label>
                      <Input type="number" step="0.01" defaultValue={0.50} />
                    </div>
                    <div className="space-y-2">
                      <Label>Base Cost per Color ($)</Label>
                      <Input type="number" step="0.01" defaultValue={0.25} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-navy border-b pb-2">Fulfillment</h3>
                    <div className="space-y-2">
                      <Label>Pick & Pack Base Cost ($)</Label>
                      <Input type="number" step="0.01" defaultValue={2.50} />
                    </div>
                    <div className="space-y-2">
                      <Label>Storage per Pallet ($/mo)</Label>
                      <Input type="number" step="0.01" defaultValue={40.00} />
                    </div>
                  </div>
                </div>
                <Button className="bg-royal text-white hover:bg-royal/90">Save Pricing Rules</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="workflow">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Workflow Configuration</CardTitle>
                <CardDescription>Configure the stages available in production and fulfillment.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-dark-gray/60 mb-4">This feature is currently locked in the prototype.</p>
                <Button disabled>Edit Workflows</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage team members and their access levels.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-dark-gray/60 mb-4">User management is handled via Firebase Auth in this prototype.</p>
                <Button disabled>Invite User</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}
