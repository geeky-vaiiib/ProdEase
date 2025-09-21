'use client';

import React, { useState } from 'react';
import { Settings, Palette, Bell, Shield, Database, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export function SettingsDropdown() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Theme Settings */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem 
              onClick={() => handleThemeChange('light')}
              className={theme === 'light' ? 'bg-accent' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <span>Light</span>
                {theme === 'light' && <span className="text-xs">✓</span>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleThemeChange('dark')}
              className={theme === 'dark' ? 'bg-accent' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <span>Dark</span>
                {theme === 'dark' && <span className="text-xs">✓</span>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleThemeChange('system')}
              className={theme === 'system' ? 'bg-accent' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <span>System</span>
                {theme === 'system' && <span className="text-xs">✓</span>}
              </div>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Notification Settings */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <div className="p-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable notifications</span>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sound alerts</span>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  disabled={!notificationsEnabled}
                />
              </div>
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Data Settings */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Database className="mr-2 h-4 w-4" />
            <span>Data & Sync</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <div className="p-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-refresh data</span>
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
              <DropdownMenuItem className="p-0">
                <Button variant="ghost" size="sm" className="w-full justify-start h-auto p-2">
                  Clear cache
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0">
                <Button variant="ghost" size="sm" className="w-full justify-start h-auto p-2">
                  Export data
                </Button>
              </DropdownMenuItem>
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Quick Actions */}
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <Shield className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
