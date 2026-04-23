import Swal from 'sweetalert2';

const isDark = () => document.documentElement.classList.contains('dark');

const base = () => ({
  background: isDark() ? '#0f172a' : '#ffffff',
  color: isDark() ? '#f1f5f9' : '#0f172a',
  customClass: {
    popup: 'rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50',
    title: 'text-xl font-bold',
    htmlContainer: 'text-sm',
    confirmButton: 'rounded-xl px-6 py-2.5 font-semibold text-sm',
    cancelButton: 'rounded-xl px-6 py-2.5 font-semibold text-sm',
    timerProgressBar: 'rounded-full',
  },
  buttonsStyling: true,
  showClass: { popup: 'animate__animated animate__fadeInDown animate__faster' },
  hideClass: { popup: 'animate__animated animate__fadeOutUp animate__faster' },
});

export const swSuccess = (title, text = '', opts = {}) =>
  Swal.fire({
    ...base(),
    icon: 'success',
    title,
    html: text
      ? `<p class="text-gray-500 dark:text-gray-400 text-sm mt-1">${text}</p>`
      : undefined,
    iconColor: '#22c55e',
    timer: opts.timer ?? 2500,
    timerProgressBar: true,
    showConfirmButton: false,
    ...opts,
  });

export const swError = (title, text = '', opts = {}) =>
  Swal.fire({
    ...base(),
    icon: 'error',
    title,
    html: text
      ? `<p class="text-gray-500 dark:text-gray-400 text-sm mt-1">${text}</p>`
      : undefined,
    iconColor: '#ef4444',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#ef4444',
    ...opts,
  });

export const swInfo = (title, text = '', opts = {}) =>
  Swal.fire({
    ...base(),
    icon: 'info',
    title,
    html: text
      ? `<p class="text-gray-500 dark:text-gray-400 text-sm mt-1">${text}</p>`
      : undefined,
    iconColor: '#3b82f6',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#3b82f6',
    ...opts,
  });

export const swWarning = (title, text = '', opts = {}) =>
  Swal.fire({
    ...base(),
    icon: 'warning',
    title,
    html: text
      ? `<p class="text-gray-500 dark:text-gray-400 text-sm mt-1">${text}</p>`
      : undefined,
    iconColor: '#f59e0b',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#f59e0b',
    ...opts,
  });

export const swConfirm = ({
  title,
  html,
  text,
  confirmText = 'Sí, confirmar',
  cancelText = 'Cancelar',
  confirmColor = '#2563eb',
  icon = 'question',
  iconColor,
} = {}) =>
  Swal.fire({
    ...base(),
    icon,
    title,
    html: html ?? (text ? `<p class="text-gray-500 dark:text-gray-400 text-sm">${text}</p>` : undefined),
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: confirmColor,
    cancelButtonColor: isDark() ? '#374151' : '#9ca3af',
    iconColor: iconColor ?? (icon === 'warning' ? '#f59e0b' : '#3b82f6'),
    reverseButtons: true,
  });

export const swDelete = (title, html) =>
  swConfirm({
    title,
    html,
    confirmText: 'Sí, eliminar',
    confirmColor: '#dc2626',
    icon: 'warning',
    iconColor: '#dc2626',
  });

export const swLoading = (title = 'Procesando...') =>
  Swal.fire({
    ...base(),
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

export const swToast = (icon, title, timer = 2500) =>
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
    background: isDark() ? '#1e293b' : '#ffffff',
    color: isDark() ? '#f1f5f9' : '#0f172a',
    iconColor:
      icon === 'success'
        ? '#22c55e'
        : icon === 'error'
          ? '#ef4444'
          : icon === 'warning'
            ? '#f59e0b'
            : '#3b82f6',
    customClass: { popup: 'rounded-xl shadow-lg text-sm' },
  });

export { Swal };
