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
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (showLoading = false) => {
    if (showLoading) setLoading(true);
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
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchNotifications(true);

    // Poll every 30 seconds for background notifications
    const interval = setInterval(() => {
      fetchNotifications(false);
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
      fetchNotifications(false);
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
        <Bell className="h-4 w-4 text-zinc-650 dark:text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-650 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-indigo-650 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-805">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <span className="text-xs mt-2">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-600 px-4 text-center space-y-2">
                <BellOff className="h-8 w-8 text-zinc-300 dark:text-zinc-800" />
                <p className="text-sm font-semibold">All caught up!</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">No notifications yet. We'll alert you when something happens.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`flex items-start gap-3 p-4 transition-colors ${
                    notif.isRead 
                      ? 'bg-white dark:bg-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10' 
                      : 'bg-indigo-50/20 dark:bg-indigo-950/10 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/15'
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full">
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-indigo-650 dark:bg-indigo-400" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.isRead ? 'text-zinc-850 dark:text-zinc-300' : 'font-bold text-zinc-900 dark:text-zinc-50'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-0.5 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  {/* Individual Actions */}
                  {!notif.isRead && (
                    <button 
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      title="Mark as read"
                      className="mt-0.5 p-1 rounded-full text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0"
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
