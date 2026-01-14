import { createSlice } from '@reduxjs/toolkit';

const NOTIFICATION_STORAGE_KEY = 'gigflow_notifications';

const loadNotifications = () => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading notifications:', error);
    return [];
  }
};

const saveNotifications = (notifications) => {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
};

const initialState = {
  notifications: loadNotifications(),
  unreadCount: loadNotifications().filter((n) => !n.read).length,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
      
      saveNotifications(state.notifications);
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        saveNotifications(state.notifications);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
      saveNotifications(state.notifications);
    },
    clearNotification: (state, action) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      saveNotifications(state.notifications);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      saveNotifications([]);
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotification,
  clearAllNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
