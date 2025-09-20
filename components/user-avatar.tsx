'use client';

import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  user?: {
    username?: string;
    email?: string;
    avatarUrl?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Generate initials from username or email
  const getInitials = () => {
    if (user?.username) {
      return user.username
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Generate a consistent color based on the user's name/email
  const getAvatarColor = () => {
    const name = user?.username || user?.email || 'User';
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {user?.avatarUrl ? (
        <AvatarImage 
          src={user.avatarUrl} 
          alt={user.username || user.email || 'User'} 
        />
      ) : null}
      <AvatarFallback className={`${getAvatarColor()} text-white font-medium`}>
        {user ? getInitials() : <User className={iconSizes[size]} />}
      </AvatarFallback>
    </Avatar>
  );
}
