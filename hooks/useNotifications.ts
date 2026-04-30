import { useEffect, useState, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  bookingId?: { _id: string; from: string; destination: string };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = getAuthToken();
    const res = await fetch('/api/notifications?limit=30', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setNotifications(data);
      const unread = data.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, []);

  const markAsRead = useCallback(async (ids: string[]) => {
    const token = getAuthToken();
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notificationIds: ids }),
    });
    setUnreadCount(prev => Math.max(0, prev - ids.length));
    setNotifications(prev => prev.map(n => ids.includes(n._id) ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
    if (unreadIds.length === 0) return;
    await markAsRead(unreadIds);
  }, [notifications, markAsRead]);

  // SSE connection
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    fetchNotifications();

    const eventSource = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`);
    setIsConnected(true);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_notification' && data.notification) {
          setNotifications(prev => [data.notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      } catch (err) {}
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [fetchNotifications]);

  return { notifications, unreadCount, isConnected, markAsRead, markAllAsRead, refresh: fetchNotifications };
}