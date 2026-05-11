import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { env } from '../config/env';
import { storage } from './storage';

export async function downloadAndShare(
  relativeUrl: string,
  fileName: string
): Promise<void> {
  const token = await storage.getToken();
  const url = `${env.apiBaseUrl}${relativeUrl}`;
  const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!dir) throw new Error('Répertoire de cache indisponible');

  const target = `${dir}${fileName}`;
  const result = await FileSystem.downloadAsync(url, target, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (result.status !== 200) {
    throw new Error(`Téléchargement échoué (${result.status})`);
  }

  if (Platform.OS === 'web') return;

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/pdf',
      dialogTitle: fileName,
      UTI: 'com.adobe.pdf',
    });
  }
}
