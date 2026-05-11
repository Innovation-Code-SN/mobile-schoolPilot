import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { registerForPushNotifications } from '../services/pushNotifications';

type NotificationData = {
  type?: string;
  entityId?: number;
  link?: string;
  [key: string]: unknown;
};

/**
 * À utiliser une seule fois au niveau racine (RootNavigator) : enregistre le device token
 * quand l'utilisateur est authentifié, et configure les listeners de réception/tap.
 */
export function usePushNotifications() {
  const { isAuthenticated } = useAuth();
  // useNavigation depuis le RootNavigator donne accès au navigateur racine
  const nav = useNavigation<any>();
  const receivedSubRef = useRef<Notifications.Subscription | null>(null);
  const responseSubRef = useRef<Notifications.Subscription | null>(null);

  // Enregistrement du token quand l'utilisateur se connecte
  useEffect(() => {
    if (!isAuthenticated) return;
    void registerForPushNotifications();
  }, [isAuthenticated]);

  // Listeners pour réception et tap
  useEffect(() => {
    receivedSubRef.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[push] received:', notification.request.content.title);
    });

    responseSubRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = (response.notification.request.content.data ?? {}) as NotificationData;
      handleNotificationTap(data, nav);
    });

    return () => {
      receivedSubRef.current?.remove();
      responseSubRef.current?.remove();
    };
  }, [nav]);
}

function handleNotificationTap(data: NotificationData, nav: any) {
  const type = (data.type ?? '').toUpperCase();
  const entityId = data.entityId;

  try {
    switch (type) {
      case 'MESSAGE':
        if (entityId) {
          nav.navigate('Parent', {
            screen: 'CommunicationsTab',
            params: { screen: 'MessageDetail', params: { id: entityId } },
          });
        }
        return;
      case 'ANNOUNCEMENT':
        if (entityId) {
          nav.navigate('Parent', {
            screen: 'CommunicationsTab',
            params: { screen: 'AnnouncementDetail', params: { id: entityId } },
          });
        }
        return;
      case 'EVENT':
        if (entityId) {
          nav.navigate('Parent', {
            screen: 'MoreTab',
            params: { screen: 'EventDetail', params: { id: entityId } },
          });
        }
        return;
      case 'INVOICE':
      case 'PAYMENT':
        nav.navigate('Parent', { screen: 'FinanceTab' });
        return;
      default:
        // Fallback : juste ouvrir l'app
        nav.navigate('Parent', { screen: 'DashboardTab' });
    }
  } catch (err) {
    console.warn('[push] navigation from notification failed:', err);
  }
}
