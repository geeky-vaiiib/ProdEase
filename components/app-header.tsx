'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { UserAvatar } from '@/components/user-avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { RealTimeIndicator } from '@/components/real-time-indicator';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Logo and Brand */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/prodease-logo.svg"
            alt="ProdEase"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="hidden font-bold sm:inline-block">ProdEase</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search orders, products..."
            className="w-full rounded-lg bg-background pl-8 pr-4 py-2 text-sm border border-input focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Real-time Status */}
        <RealTimeIndicator />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2">
            <UserAvatar user={user} size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
