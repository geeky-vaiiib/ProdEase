'use client';

import React from 'react';
import { User, Settings, BarChart3, LogOut, Shield, Bell, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'operator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || ''} alt={user.username} />
            <AvatarFallback className="text-xs">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* User Info Header */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl || ''} alt={user.username} />
              <AvatarFallback>
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <Badge 
                variant={getRoleBadgeVariant(user.role)} 
                className="mt-1 text-xs"
              >
                {user.role}
              </Badge>
            </div>
          </div>
        </div>

        <DropdownMenuLabel className="py-2">Account</DropdownMenuLabel>
        
        {/* Profile Actions */}
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/profile?tab=settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/profile?tab=notifications')}>
          <Bell className="mr-2 h-4 w-4" />
          <span>Notification Preferences</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="py-2">Reports & Analytics</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => router.push('/reports')}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>My Reports</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/reports?type=personal')}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Personal Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Admin Actions (if admin) */}
        {user.role === 'admin' && (
          <>
            <DropdownMenuLabel className="py-2">Administration</DropdownMenuLabel>
            
            <DropdownMenuItem onClick={() => router.push('/admin/users')}>
              <Shield className="mr-2 h-4 w-4" />
              <span>User Management</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push('/admin/system')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>System Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
          </>
        )}

        {/* Help & Support */}
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
