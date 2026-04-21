'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { ProsperAI } from './ProsperAI';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  ShoppingCart, 
  Printer, 
  Package, 
  FolderOpen, 
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  UserCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Customers', href: '/customers', icon: Briefcase },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Production', href: '/production', icon: Printer },
  { name: 'Fulfillment', href: '/fulfillment', icon: Package },
  { name: 'Assets', href: '/assets', icon: FolderOpen },
  { name: 'Settings', href: '/settings', icon: UserCircle },
  { name: 'Admin', href: '/admin', icon: SettingsIcon, adminOnly: true },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-light-gray overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside 
        className={cn(
          "hidden md:flex flex-col bg-white text-navy border-r border-dark-gray/10 transition-all duration-300 relative",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-16 flex items-center justify-center px-4 border-b border-dark-gray/10">
          {!isSidebarCollapsed ? (
            <Image 
              src="https://i.postimg.cc/qMfYpmQR/prospermanulogo.png" 
              alt="Prosper MFG Logo" 
              width={150} 
              height={40} 
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="font-bold text-xl text-royal">P</div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-dark-gray/10 bg-white shadow-sm text-dark-gray hover:text-navy z-10"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && profile?.role !== 'admin') return null;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md text-sm font-medium transition-colors",
                  isSidebarCollapsed ? "justify-center py-3" : "px-3 py-2.5",
                  isActive 
                    ? "bg-royal/10 text-royal" 
                    : "text-dark-gray/70 hover:bg-dark-gray/5 hover:text-navy"
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", !isSidebarCollapsed && "mr-3")} />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-dark-gray/10">
          {!isSidebarCollapsed && (
            <div className="flex items-center mb-4 px-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy truncate">{profile?.displayName || user.email}</p>
                <p className="text-xs text-dark-gray/60 truncate capitalize">{profile?.role}</p>
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-dark-gray/70 hover:text-navy hover:bg-dark-gray/5",
              isSidebarCollapsed ? "justify-center px-0" : "justify-start"
            )} 
            onClick={logout}
            title={isSidebarCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className={cn("h-4 w-4", !isSidebarCollapsed && "mr-3")} />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar (Mobile) */}
        <header className="md:hidden h-16 bg-white text-navy flex items-center justify-between px-4 border-b border-dark-gray/10 z-50 relative">
          <Image 
            src="https://i.postimg.cc/qMfYpmQR/prospermanulogo.png" 
            alt="Prosper MFG Logo" 
            width={120} 
            height={32} 
            className="object-contain"
            referrerPolicy="no-referrer"
          />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-navy hover:bg-dark-gray/5">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-16 left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto"
            >
              <nav className="px-4 py-6 space-y-2">
                {navItems.map((item) => {
                  if (item.adminOnly && profile?.role !== 'admin') return null;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-4 rounded-xl text-base font-medium transition-all",
                        isActive 
                          ? "bg-royal/10 text-royal" 
                          : "text-dark-gray/70 hover:bg-dark-gray/5 hover:text-navy"
                      )}
                    >
                      <item.icon className={cn("mr-4 h-6 w-6", isActive ? "text-royal" : "text-dark-gray/50")} />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="pt-6 mt-6 border-t border-dark-gray/10">
                  <Button variant="ghost" className="w-full justify-start text-dark-gray/70 hover:text-navy hover:bg-dark-gray/5 py-6 rounded-xl" onClick={logout}>
                    <LogOut className="mr-4 h-6 w-6 text-dark-gray/50" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-light-gray p-4 md:p-8 relative z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Floating AI Assistant */}
      <ProsperAI />
    </div>
  );
}
