import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { ref, onChildAdded, serverTimestamp, push, set } from 'firebase/database';
import { useAuth } from './AuthContext';

export interface PushNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'withdraw' | 'deposit' | 'system' | 'trade';
  amount?: number;
  destination?: string;
  timestamp: number;
  read?: boolean;
}

interface NotificationContextType {
  notifications: PushNotificationItem[];
  activePush: PushNotificationItem | null;
  unreadCount: number;
  showPushNotification: (notif: Omit<PushNotificationItem, 'id' | 'timestamp'>) => void;
  dismissPush: () => void;
  markAllAsRead: () => void;
  sendNotificationToUser: (uid: string, notif: Omit<PushNotificationItem, 'id' | 'timestamp'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a friendly, crisp two-tone mobile chime (like iOS/Android push sound)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc1.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.12); // E6
    
    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.12); // E6
    osc2.frequency.exponentialRampToValueAtTime(1760.00, ctx.currentTime + 0.35); // A6

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.25);

    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // AudioContext might be restricted until user interaction
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const activeUid = user?.uid || 'demo_user';

  const [notifications, setNotifications] = useState<PushNotificationItem[]>([]);
  const [activePush, setActivePush] = useState<PushNotificationItem | null>(null);

  // Request browser Notification API permission when user interacts
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const triggerDeviceFeedback = useCallback((title: string, message: string) => {
    // 1. Play chime sound
    playNotificationSound();

    // 2. Mobile vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([120, 80, 200]);
      } catch (e) {}
    }

    // 3. System browser push notification (if allowed)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'stockbit-withdraw',
        });
      } catch (e) {}
    }
  }, []);

  const showPushNotification = useCallback((notif: Omit<PushNotificationItem, 'id' | 'timestamp'>) => {
    const newItem: PushNotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      read: false
    };

    setActivePush(newItem);
    setNotifications(prev => [newItem, ...prev]);
    triggerDeviceFeedback(newItem.title, newItem.message);

    // Save to Firebase for persistence
    if (activeUid) {
      const notifRef = ref(db, `users/${activeUid}/notifications/${newItem.id}`);
      set(notifRef, {
        ...newItem,
        createdAt: serverTimestamp()
      }).catch(console.error);
    }
  }, [activeUid, triggerDeviceFeedback]);

  const dismissPush = useCallback(() => {
    setActivePush(null);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const sendNotificationToUser = useCallback(async (uid: string, notif: Omit<PushNotificationItem, 'id' | 'timestamp'>) => {
    const newItem: PushNotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      read: false
    };

    if (uid === activeUid) {
      showPushNotification(notif);
    } else {
      const notifRef = ref(db, `users/${uid}/notifications/${newItem.id}`);
      await set(notifRef, {
        ...newItem,
        createdAt: serverTimestamp()
      });
    }
  }, [activeUid, showPushNotification]);

  // Realtime Firebase listener for incoming notifications
  useEffect(() => {
    if (!activeUid) return;

    const notifsRef = ref(db, `users/${activeUid}/notifications`);
    const initTime = Date.now() - 5000; // Only trigger push popup for events occurring now onwards

    const unsubscribe = onChildAdded(notifsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const item: PushNotificationItem = {
          id: snapshot.key || data.id || `notif_${Date.now()}`,
          title: data.title || 'Notifikasi Baru',
          message: data.message || '',
          type: data.type || 'system',
          amount: data.amount,
          destination: data.destination,
          timestamp: data.timestamp || Date.now(),
          read: data.read || false
        };

        // If newly added after page loaded, show active push banner
        if (item.timestamp >= initTime) {
          setActivePush(item);
          triggerDeviceFeedback(item.title, item.message);
        }

        setNotifications(prev => {
          if (prev.some(p => p.id === item.id)) return prev;
          return [item, ...prev];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeUid, triggerDeviceFeedback]);

  // Also prompt permission on first mount or user click
  useEffect(() => {
    const timer = setTimeout(() => {
      requestNotificationPermission();
    }, 2000);
    return () => clearTimeout(timer);
  }, [requestNotificationPermission]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        activePush,
        unreadCount,
        showPushNotification,
        dismissPush,
        markAllAsRead,
        sendNotificationToUser
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
