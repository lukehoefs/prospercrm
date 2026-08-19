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
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-3 py-2.5 md:hidden">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Image
            src={LOGO_MARK}
            alt="Prosper"
            width={26}
            height={26}
            className="size-6.5 shrink-0 object-contain"
            unoptimized
          />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight text-navy">Prosper</p>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              Command
            </p>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-[12.5rem] transform bg-navy text-white transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex h-full flex-col px-3 py-3.5">
          <Link
            href="/"
            className="mb-5 flex items-center gap-2 px-1"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="grid size-7 place-items-center rounded bg-white/8 ring-1 ring-white/12">
              <Image
                src={LOGO_MARK}
                alt="Prosper Manufacturing"
                width={20}
                height={20}
                className="size-5 object-contain"
                unoptimized
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold leading-tight">Prosper</p>
              <p className="text-[9px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
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
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-[13px] transition-colors ${
                    isActive
                      ? 'bg-cyan font-semibold text-navy'
                      : 'text-slate-300 hover:bg-white/6 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-3">
            <p className="px-1 text-[9px] font-semibold tracking-[0.1em] text-slate-500 uppercase">
              prosper-mfg.com
            </p>
            <p className="mt-0.5 px-1 text-[11px] text-slate-400">Staff · A1 · Tijuana / SAN</p>
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
          <header className="sticky top-0 z-20 hidden h-11 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-sm md:flex">
            <div className="flex h-7 max-w-md flex-1 items-center gap-2 rounded border border-border bg-card px-2.5 text-[12px] text-muted-foreground">
              <Search className="size-3.5" />
              <span className="truncate">Search brands, quotes, orders…</span>
              <kbd className="ml-auto hidden rounded border border-border px-1.5 font-mono text-[10px] sm:inline">
                ⌘K
              </kbd>
            </div>
            <Button size="sm" className="h-7 bg-cyan px-2.5 text-[12px] text-navy hover:bg-cyan/90">
              <Plus className="size-3.5" />
              New
            </Button>
          </header>
        )}
        <main className={`min-w-0 flex-1 ${isRecord ? '' : 'p-3.5 md:p-4'}`}>{children}</main>
      </div>
    </div>
  );
}
