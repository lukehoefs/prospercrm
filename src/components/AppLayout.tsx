'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const LOGO_MARK = 'https://www.prosper-mfg.com/prosperavi.png';

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
      <div className="md:hidden flex items-center justify-between gap-3 p-3 bg-white border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Image
            src={LOGO_MARK}
            alt="Prosper"
            width={28}
            height={28}
            className="size-7 shrink-0 object-contain"
            unoptimized
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 leading-tight">
              Prosper
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Command
            </p>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-white transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex h-full flex-col p-5">
          <Link href="/" className="mb-8 flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <span className="grid size-9 place-items-center rounded-md bg-white/5 ring-1 ring-white/10">
              <Image
                src={LOGO_MARK}
                alt="Prosper Manufacturing"
                width={28}
                height={28}
                className="size-7 object-contain"
                unoptimized
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">Prosper</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Command
              </p>
            </div>
          </Link>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-4">
            <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              prosper-mfg.com
            </p>
            <p className="mt-1 px-1 text-xs text-slate-400">Staff · Command Center</p>
          </div>
        </div>
      </div>

      {/* Overlay on mobile */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full md:max-w-[calc(100vw-16rem)]">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
