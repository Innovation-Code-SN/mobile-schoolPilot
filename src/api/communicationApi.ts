import { apiClient } from './client';
import type { AnnouncementDto, MessageDto, PageResponse } from '../types/communication';

export const communicationApi = {
  // Annonces
  async getAnnouncements(page = 0, size = 20): Promise<PageResponse<AnnouncementDto>> {
    const res = await apiClient.get<PageResponse<AnnouncementDto>>(
      `/announcements?page=${page}&size=${size}`
    );
    return res.data;
  },

  async getPinnedAnnouncements(): Promise<AnnouncementDto[]> {
    const res = await apiClient.get<AnnouncementDto[]>('/announcements/pinned');
    return res.data ?? [];
  },

  async getAnnouncement(id: number): Promise<AnnouncementDto> {
    const res = await apiClient.get<AnnouncementDto>(`/announcements/${id}`);
    return res.data;
  },

  async markAnnouncementRead(id: number): Promise<void> {
    await apiClient.put(`/announcements/${id}/read`);
  },

  async acknowledgeAnnouncement(id: number): Promise<void> {
    await apiClient.put(`/announcements/${id}/acknowledge`);
  },

  // Messages
  async getInbox(page = 0, size = 20): Promise<PageResponse<MessageDto>> {
    const res = await apiClient.get<PageResponse<MessageDto>>(
      `/messages/inbox?page=${page}&size=${size}`
    );
    return res.data;
  },

  async getUnreadMessagesCount(): Promise<number> {
    const res = await apiClient.get<number>('/messages/unread/count');
    return res.data ?? 0;
  },

  async getMessage(id: number): Promise<MessageDto> {
    const res = await apiClient.get<MessageDto>(`/messages/${id}`);
    return res.data;
  },

  async getMessageThread(id: number): Promise<MessageDto[]> {
    const res = await apiClient.get<MessageDto[]>(`/messages/${id}/thread`);
    return res.data ?? [];
  },

  async markMessageRead(id: number): Promise<void> {
    await apiClient.put(`/messages/${id}/read`);
  },
};
