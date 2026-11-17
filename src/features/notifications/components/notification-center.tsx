'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Loader2, Check, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getNotificationsAction, 
  getUnreadCountAction, 
  markAsReadAction, 
  markAllAsReadAction 
} from '../actions/notification-actions';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Starts true: the mount effect always fetches. Flipping it on inside the effect
  // body instead would be a synchronous setState and an extra render pass.
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const countRes = await getUnreadCountAction();
      if (countRes.success && typeof countRes.data === 'number') {
        setUnreadCount(countRes.data);
      }
      const listRes = await getNotificationsAction();
      if (listRes.success && listRes.data) {
        setNotifications(listRes.data as NotificationItem[]);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount.
    // The lint rule flags any setState reachable from an effect body, but every
    // setState in fetchNotifications runs after an `await`, so none of them are
    // synchronous and no cascading render happens. Proper fix is to move this
    // onto the react-query client already in the dependency list.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();

    // Poll every 30 seconds for background notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Refresh list when opening dropdown
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic UI updates
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await markAsReadAction(id);
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic UI updates
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    await markAllAsReadAction();
  };

  const formatRelativeTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
        onClick={handleToggle}
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 sm:w-96">
          <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-3">
            <span className="font-heading text-sm font-bold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-brand hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 divide-y divide-border overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="mt-2 text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-2 px-4 py-12 text-center text-muted-foreground">
                <BellOff className="h-7 w-7 text-muted-foreground/50" />
                <p className="text-sm font-semibold text-foreground">All caught up</p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  No notifications yet. Activity updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-4 transition-colors ${
                    notif.isRead
                      ? 'bg-card hover:bg-secondary/40'
                      : 'bg-secondary/60 hover:bg-secondary'
                  }`}
                >
                  <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full">
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${notif.isRead ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
                      {notif.title}
                    </p>
                    <p className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground">
                      {notif.message}
                    </p>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      title="Mark as read"
                      className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-brand cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
