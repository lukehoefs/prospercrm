import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Activity, FileText } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Total Leads', value: '2,845', icon: Users, trend: '+14%' },
    { title: 'Revenue', value: '$45,231', icon: DollarSign, trend: '+8%' },
    { title: 'Active Quotes', value: '145', icon: FileText, trend: '+2%' },
    { title: 'Conversion Rate', value: '24.3%', icon: Activity, trend: '+4.1%' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome back. Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-500 mt-1">
                  {stat.trend} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">New quote generated for Acme Corp</p>
                    <p className="text-sm text-slate-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Acme Corp', amount: '$12,450' },
                { name: 'Globex Inc', amount: '$8,230' },
                { name: 'Soylent Corp', amount: '$6,100' },
                { name: 'Initech', amount: '$4,900' },
              ].map((customer) => (
                <div key={customer.name} className="flex items-center justify-between">
                  <div className="font-medium text-sm">{customer.name}</div>
                  <div className="text-sm text-slate-500">{customer.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
