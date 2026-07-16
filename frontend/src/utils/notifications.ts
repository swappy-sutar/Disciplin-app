/**
 * Utility to manage browser-level native system notifications
 * compatible with mobile device PWAs and desktop OS notification systems.
 */

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermissionState = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'default';
  return Notification.permission;
};

/**
 * Request permission from the user to send desktop/mobile system notifications.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('System notifications are not supported in this browser.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Fires a native system/desktop/mobile notification.
 */
export const sendSystemNotification = (title: string, message: string) => {
  if (!isNotificationSupported()) return;

  const isEnabled = localStorage.getItem('disciplin_system_notifications') === 'true';
  if (!isEnabled || Notification.permission !== 'granted') return;

  // Use service worker notification showing if active (robust on mobile Chrome/Android)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.showNotification(title, {
          body: message,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          vibrate: [100, 50, 100],
          tag: 'disciplin-alert',
          renotify: true
        });
      })
      .catch((err) => {
        console.warn('Service worker fallback to direct Notification API:', err);
        // Fallback directly to Notification constructor (for desktop browser)
        new Notification(title, {
          body: message,
          icon: '/favicon.svg'
        });
      });
  } else {
    // Standard direct call (Desktop Safari/Firefox/Chrome standalone fallback)
    try {
      new Notification(title, {
        body: message,
        icon: '/favicon.svg'
      });
    } catch (e) {
      console.error('Failed to trigger direct notification:', e);
    }
  }
};
