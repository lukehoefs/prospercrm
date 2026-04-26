import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-sm">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Luke" />
              </div>
              <div className="space-y-2 max-w-sm">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="luke@prosper-mfg.com" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Settings coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
