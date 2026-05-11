import { apiClient } from './client';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type NotificationCategory =
  | 'ADMISSIONS'
  | 'FINANCE'
  | 'ACADEMICS'
  | 'HR'
  | 'COMMUNICATION'
  | 'SYSTEM'
  | 'TRANSPORT'
  | 'LIBRARY'
  | 'INFIRMARY';

export interface NotificationDto {
  id: number;
  recipientId?: number;
  notificationType?: string;
  notificationTypeLabel?: string;
  category?: NotificationCategory;
  categoryLabel?: string;
  priority?: NotificationPriority;
  title: string;
  message?: string;
  actionUrl?: string;
  icon?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  timeAgo?: string;
  referenceType?: string;
  referenceId?: number;
}

export interface NotificationPage {
  content: NotificationDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}

export interface NotificationCountDto {
  totalUnread?: number;
  /** Compat ancien nom (apiClient pouvait renvoyer unreadCount) */
  unreadCount?: number;
}

export const notificationApi = {
  /**
   * Liste paginée des notifications de l'utilisateur connecté.
   * Mappée sur GET /notifications?page=&size=
   */
  async getList(page = 0, size = 20): Promise<NotificationPage> {
    const res = await apiClient.get<NotificationPage>(
      `/notifications?page=${page}&size=${size}`
    );
    return (
      res.data ?? {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size,
        number: page,
      }
    );
  },

  /** Top N notifications récentes (pour aperçu rapide). */
  async getRecent(limit = 5): Promise<NotificationDto[]> {
    const res = await apiClient.get<NotificationDto[]>(
      `/notifications/recent?limit=${limit}`
    );
    return res.data ?? [];
  },

  /** Compteur de notifications non lues (pour le badge sur la cloche). */
  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<NotificationCountDto>('/notifications/unread-count');
    const data = res.data;
    return data?.totalUnread ?? data?.unreadCount ?? 0;
  },

  async markRead(id: number): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },

  async markUnread(id: number): Promise<void> {
    await apiClient.put(`/notifications/${id}/unread`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.put('/notifications/mark-all-read');
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  // Endpoint à créer côté backend pour push notifications
  async registerDeviceToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    try {
      await apiClient.post('/notifications/device-token', { token, platform });
    } catch (err) {
      // Silencieux : l'endpoint n'existe pas encore côté backend
      console.warn('[push] device token registration failed (endpoint may not exist yet):', err);
    }
  },
};

/** Labels FR par catégorie pour les badges. */
export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  ADMISSIONS: 'Admissions',
  FINANCE: 'Finance',
  ACADEMICS: 'Académique',
  HR: 'RH',
  COMMUNICATION: 'Messages',
  SYSTEM: 'Système',
  TRANSPORT: 'Transport',
  LIBRARY: 'Bibliothèque',
  INFIRMARY: 'Infirmerie',
};

/** Couleur de la pastille de catégorie (hex). */
export const NOTIFICATION_CATEGORY_COLORS: Record<NotificationCategory, string> = {
  ADMISSIONS: '#7c3aed',
  FINANCE: '#f59e0b',
  ACADEMICS: '#3b82f6',
  HR: '#0891b2',
  COMMUNICATION: '#8b5cf6',
  SYSTEM: '#6b7280',
  TRANSPORT: '#10b981',
  LIBRARY: '#0ea5e9',
  INFIRMARY: '#ef4444',
};

/** Icône Ionicons par catégorie (gardée simple, pas de dépendance forte au type). */
export const NOTIFICATION_CATEGORY_ICONS: Record<NotificationCategory, string> = {
  ADMISSIONS: 'person-add',
  FINANCE: 'cash',
  ACADEMICS: 'school',
  HR: 'briefcase',
  COMMUNICATION: 'chatbubbles',
  SYSTEM: 'settings',
  TRANSPORT: 'bus',
  LIBRARY: 'book',
  INFIRMARY: 'heart',
};
