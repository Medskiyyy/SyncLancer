'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
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

    return items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [workspaceSlug, isClient, query]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

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
      <DialogContent showCloseButton={false} className="max-w-lg p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl rounded-xl">
        <div className="flex items-center border-b border-zinc-150 dark:border-zinc-800 px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Search className="mr-3 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search dashboard page or workspace settings..."
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none border-none focus:ring-0"
            autoFocus
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-zinc-200 bg-white px-1.5 font-mono text-[10px] font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 sm:flex">
            <span>ESC</span>
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {searchItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
              <Sparkles className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2 animate-pulse" />
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No results found</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Try searching for CRM, Invoices, or Settings</p>
            </div>
          ) : (
            <div className="space-y-1">
              {searchItems.map((item, index) => (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors cursor-pointer outline-none",
                    index === selectedIndex
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-200/50 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                      {item.category}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {index === selectedIndex && (
                    <ArrowRight className="h-3.5 w-3.5 text-primary opacity-80" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-150 dark:border-zinc-800 px-4 py-2 text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-1.5">
            <span>Use</span>
            <kbd className="rounded bg-zinc-200/50 dark:bg-zinc-800 px-1">↑↓</kbd>
            <span>to navigate</span>
            <kbd className="rounded bg-zinc-200/50 dark:bg-zinc-800 px-1">Enter</kbd>
            <span>to select</span>
          </div>
          <span>SyncLancer Pro</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
