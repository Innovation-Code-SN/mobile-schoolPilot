import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationApi } from '../api/notificationApi';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

let registered = false;

export async function registerForPushNotifications(): Promise<string | null> {
  if (registered) return null;

  if (!Device.isDevice) {
    console.log('[push] simulator/emulator detected — push not supported');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[push] permission not granted');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifications par défaut',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D86430',
      });
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const token = tokenResponse.data;

    if (token) {
      await notificationApi.registerDeviceToken(
        token,
        Platform.OS === 'ios' ? 'ios' : 'android'
      );
      registered = true;
      console.log('[push] registered:', token);
    }

    return token;
  } catch (err) {
    console.warn('[push] registration failed:', err);
    return null;
  }
}

export function unregisterPushNotifications() {
  registered = false;
}
