import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Operator profile and notification preferences."
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div className="max-w-lg rounded-md border border-border bg-card p-5 shadow-sm">
            <h2 className="section-title">Profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">How you appear on the book.</p>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Luke Hoefs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="luke@prosper-mfg.com" />
              </div>
              <Button size="sm" className="bg-cyan text-navy hover:bg-cyan/90">
                Save changes
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="max-w-lg rounded-md border border-border bg-card p-5 shadow-sm">
            <h2 className="section-title">Notifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quote views, sample updates, and stale programs. Preferences coming next.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
