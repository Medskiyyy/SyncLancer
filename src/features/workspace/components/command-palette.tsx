'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceSlug: string;
  isClient: boolean;
}

export function CommandPalette({ isOpen, onClose, workspaceSlug, isClient }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const searchItems = React.useMemo(() => {
    const items = isClient
      ? [
          { name: 'Dashboard', href: `/${workspaceSlug}/portal`, category: 'Portal' },
          { name: 'Invoices', href: `/${workspaceSlug}/portal/invoices`, category: 'Portal' },
          { name: 'Files', href: `/${workspaceSlug}/portal/files`, category: 'Portal' },
        ]
      : [
          { name: 'Dashboard', href: `/${workspaceSlug}`, category: 'Overview' },
          { name: 'CRM (Lead Kanban)', href: `/${workspaceSlug}/crm`, category: 'Workspace' },
          { name: 'Clients', href: `/${workspaceSlug}/clients`, category: 'Workspace' },
          { name: 'Proposals', href: `/${workspaceSlug}/proposals`, category: 'Workspace' },
          { name: 'Projects', href: `/${workspaceSlug}/projects`, category: 'Workspace' },
          { name: 'Invoices', href: `/${workspaceSlug}/invoices`, category: 'Finance' },
          { name: 'Files', href: `/${workspaceSlug}/files`, category: 'Finance' },
          { name: 'Analytics', href: `/${workspaceSlug}/analytics`, category: 'Finance' },
          { name: 'Settings', href: `/${workspaceSlug}/settings`, category: 'Admin' },
        ];

    if (!query) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [workspaceSlug, isClient, query]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchItems.length) % searchItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchItems[selectedIndex]) {
        handleSelect(searchItems[selectedIndex].href);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg overflow-hidden rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-xl"
      >
        <div className="flex items-center border-b border-border bg-secondary/50 px-4 py-3">
          <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search dashboard page or workspace settings..."
            className="w-full border-none bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-0"
            autoFocus
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[11px] font-medium text-muted-foreground sm:flex">
            <span>ESC</span>
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {searchItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
              <Search className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No results found</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Try searching for CRM, Invoices, or Settings</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {searchItems.map((item, index) => (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer outline-none',
                    index === selectedIndex
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-[4px] border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {item.category}
                    </span>
                    <span className="font-medium text-foreground">{item.name}</span>
                  </div>
                  {index === selectedIndex && (
                    <ArrowRight className="h-3.5 w-3.5 text-brand" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>Use</span>
            <kbd className="rounded border border-border bg-background px-1 font-mono">Up/Down</kbd>
            <span>to navigate</span>
            <kbd className="rounded border border-border bg-background px-1 font-mono">Enter</kbd>
            <span>to select</span>
          </div>
          <span>SyncLancer</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
