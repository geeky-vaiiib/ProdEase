'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Wrench, BarChart3, Users, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/data-context';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'order' | 'product' | 'work-center' | 'stock' | 'user' | 'report';
  url: string;
  status?: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();
  const { orders } = useData();

  // Mock data for demonstration
  const mockData: SearchResult[] = [
    {
      id: '1',
      title: 'Steel Frame Assembly',
      subtitle: 'MO-2025-001',
      type: 'order',
      url: '/manufacturing-orders',
      status: 'In Progress'
    },
    {
      id: '2',
      title: 'Aluminum Housing',
      subtitle: 'MO-2025-002',
      type: 'order',
      url: '/manufacturing-orders',
      status: 'Draft'
    },
    {
      id: '3',
      title: 'Assembly Line 1',
      subtitle: 'WC-001 • 85% efficiency',
      type: 'work-center',
      url: '/work-centers',
      status: 'Active'
    },
    {
      id: '4',
      title: 'Aluminum Sheet 2mm',
      subtitle: '150 units in stock',
      type: 'stock',
      url: '/stock-ledger',
      status: 'In Stock'
    },
    {
      id: '5',
      title: 'Production Report',
      subtitle: 'Weekly manufacturing summary',
      type: 'report',
      url: '/reports',
    },
  ];

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'order':
        return <Package className="h-4 w-4" />;
      case 'work-center':
        return <Wrench className="h-4 w-4" />;
      case 'stock':
        return <BarChart3 className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'report':
        return <FileText className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
      case 'active':
      case 'in stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    router.push(result.url);
  };

  return (
    <>
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders, products... (⌘K)"
          className="pl-8 pr-4"
          onClick={() => setOpen(true)}
          readOnly
        />
      </div>

      {/* Search Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search orders, products, work centers..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {results.length > 0 && (
            <>
              <CommandGroup heading="Manufacturing Orders">
                {results
                  .filter(r => r.type === 'order')
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3 p-3"
                    >
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.title}</span>
                          {result.status && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getStatusColor(result.status)}`}
                            >
                              {result.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>

              <CommandGroup heading="Work Centers">
                {results
                  .filter(r => r.type === 'work-center')
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3 p-3"
                    >
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.title}</span>
                          {result.status && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getStatusColor(result.status)}`}
                            >
                              {result.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>

              <CommandGroup heading="Stock & Inventory">
                {results
                  .filter(r => r.type === 'stock')
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3 p-3"
                    >
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.title}</span>
                          {result.status && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getStatusColor(result.status)}`}
                            >
                              {result.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>

              <CommandGroup heading="Reports">
                {results
                  .filter(r => r.type === 'report')
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3 p-3"
                    >
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{result.title}</span>
                        <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
