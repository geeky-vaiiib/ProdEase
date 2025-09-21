'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { RealTimeIndicator } from '@/components/real-time-indicator';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { SettingsDropdown } from '@/components/settings-dropdown';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
import { GlobalSearch } from '@/components/global-search';

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

      {/* Global Search */}
      <GlobalSearch />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Real-time Status */}
        <RealTimeIndicator />

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Settings */}
        <SettingsDropdown />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile */}
        {user && <UserProfileDropdown />}
      </div>
    </header>
  );
}
