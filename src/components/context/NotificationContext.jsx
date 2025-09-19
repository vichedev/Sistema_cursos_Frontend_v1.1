// src/context/NotificationContext.jsx
import { createContext, useContext, useReducer } from 'react';

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [...state, { ...action.payload, id: Date.now(), read: false }];
    
    case 'MARK_AS_READ':
      return state.map(notification =>
        notification.id === action.id ? { ...notification, read: true } : notification
      );
    
    case 'CLEAR_ALL':
      return [];
    
    case 'UPDATE_PROGRESS':
      return state.map(notification =>
        notification.id === action.id
          ? { ...notification, progress: action.progress }
          : notification
      );
    
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  const addNotification = (notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markAsRead = (id) => {
    dispatch({ type: 'MARK_AS_READ', id });
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const updateProgress = (id, progress) => {
    dispatch({ type: 'UPDATE_PROGRESS', id, progress });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearAllNotifications,
        updateProgress
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};