'use server';

import { auth } from '@/auth';
import { NotificationService } from '../services/notification-service';
import { revalidatePath } from 'next/cache';

const notificationService = new NotificationService();

export async function getNotificationsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const notifications = await notificationService.getNotifications(session.user.id);
    return { success: true, data: notifications };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch notifications' };
  }
}

export async function getUnreadCountAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const count = await notificationService.getUnreadCount(session.user.id);
    return { success: true, data: count };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch unread count' };
  }
}

export async function markAsReadAction(notificationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await notificationService.markAsRead(notificationId, session.user.id);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to mark notification as read' };
  }
}

export async function markAllAsReadAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await notificationService.markAllAsRead(session.user.id);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to mark all notifications as read' };
  }
}
