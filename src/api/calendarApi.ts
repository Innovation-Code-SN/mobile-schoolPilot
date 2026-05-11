import { apiClient } from './client';
import type { CalendarEventDto, SchoolEventDto } from '../types/calendar';
import type { PageResponse } from '../types/communication';

export const calendarApi = {
  async getUpcomingEvents(page = 0, size = 30): Promise<PageResponse<SchoolEventDto>> {
    const res = await apiClient.get<PageResponse<SchoolEventDto>>(
      `/events?page=${page}&size=${size}`
    );
    return res.data;
  },

  async getTodayEvents(): Promise<SchoolEventDto[]> {
    const res = await apiClient.get<SchoolEventDto[]>('/events/today');
    return res.data ?? [];
  },

  async getOngoingEvents(): Promise<SchoolEventDto[]> {
    const res = await apiClient.get<SchoolEventDto[]>('/events/ongoing');
    return res.data ?? [];
  },

  async getEvent(id: number): Promise<SchoolEventDto> {
    const res = await apiClient.get<SchoolEventDto>(`/events/${id}`);
    return res.data;
  },

  async getCalendarMonth(year: number, month: number): Promise<CalendarEventDto[]> {
    const res = await apiClient.get<CalendarEventDto[]>(`/events/calendar/${year}/${month}`);
    return res.data ?? [];
  },

  async getHolidays(): Promise<CalendarEventDto[]> {
    const res = await apiClient.get<CalendarEventDto[]>('/events/holidays');
    return res.data ?? [];
  },

  async getExams(): Promise<SchoolEventDto[]> {
    const res = await apiClient.get<SchoolEventDto[]>('/events/exams');
    return res.data ?? [];
  },

  async getParentMeetings(): Promise<SchoolEventDto[]> {
    const res = await apiClient.get<SchoolEventDto[]>('/events/parent-meetings');
    return res.data ?? [];
  },
};
