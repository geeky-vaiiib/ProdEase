'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useData } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function RealTimeIndicator() {
  const { isLoading, error, refreshData } = useData();

  const getStatusIcon = () => {
    if (error) {
      return <WifiOff className="h-4 w-4 text-destructive" />;
    }
    if (isLoading) {
      return <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />;
    }
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (error) {
      return 'Connection error - Click to retry';
    }
    if (isLoading) {
      return 'Syncing data...';
    }
    return 'Real-time updates active';
  };

  const getStatusColor = () => {
    if (error) {
      return 'text-destructive';
    }
    if (isLoading) {
      return 'text-muted-foreground';
    }
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={error ? refreshData : undefined}
            className={`h-8 px-2 gap-2 ${error ? 'hover:bg-destructive/10' : ''}`}
            disabled={isLoading}
          >
            {getStatusIcon()}
            <span className={`text-xs font-medium ${getStatusColor()}`}>
              {error ? 'Offline' : isLoading ? 'Syncing' : 'Live'}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DataSyncStatus() {
  const { isLoading, error } = useData();

  if (!isLoading && !error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border
        ${error 
          ? 'bg-destructive/10 border-destructive/20 text-destructive' 
          : 'bg-background border-border'
        }
      `}>
        {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
        {error && <WifiOff className="h-4 w-4" />}
        <span className="text-sm font-medium">
          {error ? 'Connection lost' : 'Syncing data...'}
        </span>
      </div>
    </div>
  );
}
