// src/context/NotificationContext.jsx
import { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const NotificationContext = createContext();

// 🔑 storage + endpoint
const STORAGE_KEY = 'admin_notifications_v1';
const SSE_URL = (import.meta.env.VITE_BACKEND_URL || '')
  .replace(/\/$/, '') + '/notifications/stream';

// ---------- Reducer helpers
const normId = (v) => Number(v);

// dedup de tarjetas por curso, conservando la de mayor progreso
const dedupByCourse = (list) => {
  const map = new Map(); // key: courseId
  for (const n of list) {
    if (n.kind !== 'course') {
      map.set(Symbol(), n);
      continue;
    }
    const key = normId(n.courseId);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { ...n, courseId: key });
    } else {
      const a = prev.progress?.completed ?? 0;
      const b = n.progress?.completed ?? 0;
      map.set(key, b >= a ? { ...n, courseId: key } : prev);
    }
  }
  return [...map.values()];
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE': {
      const payload = Array.isArray(action.payload) ? action.payload : [];
      // normaliza courseId y dedup
      const normalized = payload.map((n) =>
        n.kind === 'course' ? { ...n, courseId: normId(n.courseId) } : n
      );
      return dedupByCourse(normalized);
    }

    // 1 tarjeta por curso: si llega START y ya existe, actualizo total y dejo unread
    case 'COURSE_START': {
      const courseId = normId(action.payload.courseId);
      const title = action.payload.title || 'Curso';
      const total = Number(action.payload.total) || 0;
      const timestamp = action.payload.timestamp || Date.now();

      const existing = state.find(
        (n) => n.kind === 'course' && normId(n.courseId) === courseId
      );

      if (!existing) {
        const base = {
          id: Date.now() + courseId,
          kind: 'course',
          type: 'course',
          read: false,
          title: 'Enviando notificaciones',
          message: `Curso: ${title}`,
          courseId,
          progress: { completed: 0, total },
          timestamp,
        };
        return [base, ...state];
      }

      return state.map((n) =>
        n.kind === 'course' && normId(n.courseId) === courseId
          ? {
              ...n,
              message: `Curso: ${title}`,
              read: false,
              progress: { ...n.progress, total: total || n.progress.total },
            }
          : n
      );
    }

    case 'COURSE_PROGRESS': {
      const courseId = normId(action.payload.courseId);
      const completed = Number(action.payload.completed) || 0;
      const total = action.payload.total != null ? Number(action.payload.total) : undefined;

      return state.map((n) =>
        n.kind === 'course' && normId(n.courseId) === courseId
          ? {
              ...n,
              progress: {
                completed,
                total: total != null ? total : (n.progress?.total ?? 0),
              },
            }
          : n
      );
    }

    case 'COURSE_DONE': {
      const courseId = normId(action.payload.courseId);
      return state.map((n) =>
        n.kind === 'course' && normId(n.courseId) === courseId
          ? {
              ...n,
              title: 'Notificaciones enviadas',
              read: false,
              finished: true,
              progress: {
                completed: n.progress?.total ?? n.progress?.completed ?? 0,
                total: n.progress?.total ?? n.progress?.completed ?? 0,
              },
            }
          : n
      );
    }

    case 'ADD_NOTIFICATION':
      return [{ ...action.payload, id: Date.now(), read: false }, ...state];

    case 'MARK_AS_READ':
      return state.map((n) => (n.id === action.id ? { ...n, read: true } : n));

    case 'CLEAR_ALL':
      return [];

    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, []);
  const esRef = useRef(null);
  const saveTimer = useRef(null);

  // Cargar del storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: 'HYDRATE', payload: parsed });
      }
    } catch {}
  }, []);

  // Guardar en storage (debounced)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      } catch {}
    }, 200);
    return () => clearTimeout(saveTimer.current);
  }, [notifications]);

  // Suscripción SSE con autorreconexión
  useEffect(() => {
    const connect = () => {
      if (esRef.current) {
        try {
          esRef.current.close();
        } catch {}
      }
      const es = new EventSource(SSE_URL);
      esRef.current = es;

      es.onerror = () => {
        try {
          es.close();
        } catch {}
        esRef.current = null;
        setTimeout(connect, 3000);
      };

      es.onmessage = (e) => {
        if (!e?.data) return;
        try {
          const p = JSON.parse(e.data);

          switch (p?.type) {
            case 'COURSE_NOTIFY_START':
              dispatch({
                type: 'COURSE_START',
                payload: {
                  courseId: normId(p.courseId),
                  title: p.title || 'Curso',
                  total: Number(p.total) || 0,
                  timestamp: Date.now(),
                },
              });
              break;

            case 'COURSE_NOTIFY_PROGRESS':
              dispatch({
                type: 'COURSE_PROGRESS',
                payload: {
                  courseId: normId(p.courseId),
                  completed: Number(p.completed) || 0,
                  total: p.total != null ? Number(p.total) : undefined,
                },
              });
              break;

            case 'COURSE_NOTIFY_DONE':
              dispatch({
                type: 'COURSE_DONE',
                payload: { courseId: normId(p.courseId) },
              });
              break;

            default:
              break;
          }
        } catch {}
      };
    };

    connect();
    return () => {
      if (esRef.current) {
        try {
          esRef.current.close();
        } catch {}
      }
    };
  }, []);

  // API pública
  const addNotification = (n) => dispatch({ type: 'ADD_NOTIFICATION', payload: n });
  const markAsRead = (id) => dispatch({ type: 'MARK_AS_READ', id });
  const clearAllNotifications = () => dispatch({ type: 'CLEAR_ALL' });

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, clearAllNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};
