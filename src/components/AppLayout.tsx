'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  FileText,
  ShoppingCart,
  Settings,
  Menu,
  X,
  Search,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const LOGO_MARK = 'https://www.prosper-mfg.com/prosperavi.png';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Command', href: '/', icon: LayoutDashboard },
    { name: 'Brands', href: '/leads', icon: Building2 },
    { name: 'Quotes', href: '/quotes', icon: FileText },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isRecord = pathname.startsWith('/leads/') && pathname !== '/leads';

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card p-3 md:hidden">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Image
            src={LOGO_MARK}
            alt="Prosper"
            width={28}
            height={28}
            className="size-7 shrink-0 object-contain"
            unoptimized
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-navy">Prosper</p>
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
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

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-[13.25rem] transform bg-navy text-white transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex h-full flex-col p-4">
          <Link
            href="/"
            className="mb-6 flex items-center gap-2.5"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="grid size-8 place-items-center rounded-md bg-white/5 ring-1 ring-white/10">
              <Image
                src={LOGO_MARK}
                alt="Prosper Manufacturing"
                width={24}
                height={24}
                className="size-6 object-contain"
                unoptimized
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">Prosper</p>
              <p className="text-[10px] font-semibold tracking-[0.08em] text-slate-400 uppercase">
                Command
              </p>
            </div>
          </Link>

          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-cyan text-navy font-semibold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-3">
            <p className="px-1 text-[10px] font-medium tracking-wider text-slate-500 uppercase">
              prosper-mfg.com
            </p>
            <p className="mt-1 px-1 text-xs text-slate-400">Staff · A1 · Tijuana / SAN</p>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {!isRecord && (
          <header className="sticky top-0 z-20 hidden h-12 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur-sm md:flex">
            <div className="flex h-8 max-w-md flex-1 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-sm text-muted-foreground">
              <Search className="size-3.5" />
              <span className="truncate">Search brands, quotes, orders…</span>
              <kbd className="ml-auto hidden rounded border border-border px-1.5 font-mono text-[10px] sm:inline">
                ⌘K
              </kbd>
            </div>
            <Button size="sm" className="bg-cyan text-navy hover:bg-cyan/90">
              <Plus className="size-3.5" />
              New
            </Button>
          </header>
        )}
        <main className={`min-w-0 flex-1 ${isRecord ? '' : 'p-4 md:p-6'}`}>{children}</main>
      </div>
    </div>
  );
}
