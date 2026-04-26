'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShoppingCart, 
  Settings,
  Menu
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Quotes', href: '/quotes', icon: FileText },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
        <div className="font-bold text-xl tracking-tight text-slate-900">CRM Pro</div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <div className="font-bold text-2xl tracking-tight mb-8 hidden md:block">CRM Pro</div>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full md:max-w-[calc(100vw-16rem)]">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
