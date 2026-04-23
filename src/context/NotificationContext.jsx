// src/context/NotificationContext.jsx
import { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const NotificationContext = createContext();

const SSE_URL = (import.meta.env.VITE_BACKEND_URL || '')
  .replace(/\/$/, '') + '/api/notifications/stream';

const normId = (v) => Number(v);

const dedupByCourse = (list) => {
  const map = new Map();
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
      const normalized = payload.map((n) =>
        n.kind === 'course' ? { ...n, courseId: normId(n.courseId) } : n,
      );
      return dedupByCourse(normalized);
    }

    case 'COURSE_START': {
      const courseId = normId(action.payload.courseId);
      const { title, total, timestamp } = action.payload;
      const existing = state.find(
        (n) => n.kind === 'course' && normId(n.courseId) === courseId,
      );
      if (!existing) {
        return [
          {
            id: Date.now() + courseId,
            kind: 'course',
            type: 'course',
            read: false,
            title: 'Enviando notificaciones',
            message: `Curso: ${title}`,
            courseId,
            progress: { completed: 0, total: Number(total) || 0 },
            timestamp: timestamp || Date.now(),
          },
          ...state,
        ];
      }
      return state.map((n) =>
        n.kind === 'course' && normId(n.courseId) === courseId
          ? { ...n, message: `Curso: ${title}`, read: false, progress: { ...n.progress, total: total || n.progress.total } }
          : n,
      );
    }

    case 'COURSE_PROGRESS': {
      const courseId = normId(action.payload.courseId);
      const { completed, total } = action.payload;
      return state.map((n) =>
        n.kind === 'course' && normId(n.courseId) === courseId
          ? { ...n, progress: { completed: Number(completed) || 0, total: total != null ? Number(total) : (n.progress?.total ?? 0) } }
          : n,
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
          : n,
      );
    }

    // Nuevo curso publicado por el admin — recibido por estudiantes
    case 'NEW_COURSE': {
      const courseId = normId(action.payload.courseId);
      const existing = state.find((n) => n.kind === 'new_course' && normId(n.courseId) === courseId);
      if (existing) return state; // no duplicar
      return [
        {
          id: Date.now() + courseId,
          kind: 'new_course',
          type: 'new_course',
          read: false,
          title: '¡Nuevo curso disponible!',
          message: action.payload.titulo,
          courseId,
          courseData: action.payload,
          timestamp: Date.now(),
        },
        ...state,
      ];
    }

    // Diploma generado — solo para el estudiante destinatario
    case 'DIPLOMA_GENERATED': {
      const existing = state.find((n) => n.kind === 'diploma' && n.codigo === action.payload.codigo);
      if (existing) return state;
      return [
        {
          id: Date.now(),
          kind: 'diploma',
          type: 'diploma',
          read: false,
          title: '¡Tu diploma está listo!',
          message: action.payload.titulo,
          courseId: normId(action.payload.courseId),
          codigo: action.payload.codigo,
          nombres: action.payload.nombres,
          timestamp: Date.now(),
        },
        ...state,
      ];
    }

    case 'ADD_NOTIFICATION':
      return [{ ...action.payload, id: Date.now(), read: false }, ...state];

    case 'MARK_AS_READ':
      return state.map((n) => (n.id === action.id ? { ...n, read: true } : n));

    case 'MARK_ALL_READ':
      return state.map((n) => ({ ...n, read: true }));

    case 'CLEAR_ALL':
      return [];

    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const storageKeyRef = useRef(null);

  // Determinar clave de storage según rol (leído una sola vez al montar)
  if (!storageKeyRef.current) {
    const role = localStorage.getItem('rol');
    storageKeyRef.current = role === 'ESTUDIANTE' ? 'student_notifications_v1' : 'admin_notifications_v1';
  }
  const STORAGE_KEY = storageKeyRef.current;

  const [notifications, dispatch] = useReducer(notificationReducer, []);
  const esRef = useRef(null);
  const saveTimer = useRef(null);

  // Cargar del storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
    } catch {}
  }, [STORAGE_KEY]);

  // Guardar en storage (debounced 200ms)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)); } catch {}
    }, 200);
    return () => clearTimeout(saveTimer.current);
  }, [notifications, STORAGE_KEY]);

  // SSE con autorreconexión
  useEffect(() => {
    const connect = () => {
      if (esRef.current) { try { esRef.current.close(); } catch {} }
      const es = new EventSource(SSE_URL);
      esRef.current = es;

      es.onerror = () => {
        try { es.close(); } catch {}
        esRef.current = null;
        setTimeout(connect, 3000);
      };

      es.onmessage = (e) => {
        if (!e?.data) return;
        try {
          const p = JSON.parse(e.data);
          switch (p?.type) {
            case 'COURSE_NOTIFY_START':
              dispatch({ type: 'COURSE_START', payload: { courseId: normId(p.courseId), title: p.title || 'Curso', total: Number(p.total) || 0, timestamp: Date.now() } });
              break;
            case 'COURSE_NOTIFY_PROGRESS':
              dispatch({ type: 'COURSE_PROGRESS', payload: { courseId: normId(p.courseId), completed: Number(p.completed) || 0, total: p.total != null ? Number(p.total) : undefined } });
              break;
            case 'COURSE_NOTIFY_DONE':
              dispatch({ type: 'COURSE_DONE', payload: { courseId: normId(p.courseId) } });
              break;
            case 'NEW_COURSE':
              dispatch({ type: 'NEW_COURSE', payload: { courseId: normId(p.courseId), titulo: p.titulo, tipo: p.tipo, precio: p.precio, imagen: p.imagen } });
              break;
            case 'DIPLOMA_GENERATED': {
              const myId = normId(localStorage.getItem('userId'));
              if (normId(p.estudianteId) === myId) {
                dispatch({ type: 'DIPLOMA_GENERATED', payload: { estudianteId: normId(p.estudianteId), courseId: normId(p.courseId), titulo: p.titulo, codigo: p.codigo, nombres: p.nombres } });
              }
              break;
            }
            default:
              break;
          }
        } catch {}
      };
    };

    connect();
    return () => { if (esRef.current) { try { esRef.current.close(); } catch {} } };
  }, []);

  const addNotification = (n) => dispatch({ type: 'ADD_NOTIFICATION', payload: n });
  const markAsRead = (id) => dispatch({ type: 'MARK_AS_READ', id });
  const markAllRead = () => dispatch({ type: 'MARK_ALL_READ' });
  const clearAllNotifications = () => dispatch({ type: 'CLEAR_ALL' });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const newCourseNotifications = notifications.filter((n) => n.kind === 'new_course' && !n.read);
  const diplomaNotifications = notifications.filter((n) => n.kind === 'diploma' && !n.read);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, markAllRead, clearAllNotifications, unreadCount, newCourseNotifications, diplomaNotifications }}
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
