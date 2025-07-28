import { create } from 'zustand';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Auto-remove notification after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, duration);
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  }
}));