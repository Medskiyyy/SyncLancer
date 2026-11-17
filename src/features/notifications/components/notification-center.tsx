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
      {/* Bell Trigger */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        onClick={handleToggle}
      >
        <Bell className="h-4 w-4 text-slate-600 dark:text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 border border-border bg-popover text-popover-foreground rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <span className="text-sm font-bold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs mt-2">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground px-4 text-center space-y-2">
                <BellOff className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-semibold text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground max-w-xs">No notifications yet. We&rsquo;ll alert you when something happens.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`flex items-start gap-3 p-4 transition-colors ${
                    notif.isRead 
                      ? 'bg-card hover:bg-muted/40' 
                      : 'bg-primary/5 hover:bg-primary/10'
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full">
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.isRead ? 'text-muted-foreground' : 'font-bold text-foreground'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  {/* Individual Actions */}
                  {!notif.isRead && (
                    <button 
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      title="Mark as read"
                      className="mt-0.5 p-1 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-all shrink-0 cursor-pointer"
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
