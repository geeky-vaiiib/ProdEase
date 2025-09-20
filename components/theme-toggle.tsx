'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/theme-context';

export function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 transition-colors hover:bg-accent hover:text-accent-foreground"
          title="Toggle theme"
        >
          {actualTheme === 'light' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`transition-colors ${theme === 'light' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
        >
          <Sun className="mr-2 h-4 w-4 text-yellow-500" />
          <span className="flex-1">Light</span>
          {theme === 'light' && <span className="text-xs text-muted-foreground">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`transition-colors ${theme === 'dark' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
        >
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          <span className="flex-1">Dark</span>
          {theme === 'dark' && <span className="text-xs text-muted-foreground">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`transition-colors ${theme === 'system' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
        >
          <Monitor className="mr-2 h-4 w-4 text-gray-500" />
          <span className="flex-1">System</span>
          {theme === 'system' && <span className="text-xs text-muted-foreground">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
