// src/api/transportApi.ts
// Module Transport côté parent connecté.
// Backend : /parent-portal/transport/* (permission PARENT_VIEW_TRANSPORT).
//
// Tous les endpoints requièrent un parameter `parentUserId` correspondant à
// l'utilisateur connecté (le backend valide qu'il s'agit bien du parent
// rattaché à l'élève).
import { apiClient } from './client';
import type {
  ChildTransportInfo,
  AttendanceSummary,
  TransportAttendance,
} from '../types/transport';

/**
 * Page Spring renvoyée par le backend pour les listes paginées.
 */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}

export const transportApi = {
  /**
   * Liste les enfants du parent avec leurs infos transport (résumé).
   */
  async getChildren(parentUserId: number): Promise<ChildTransportInfo[]> {
    const res = await apiClient.get<ChildTransportInfo[]>(
      `/parent-portal/transport/children?parentUserId=${parentUserId}`,
    );
    return res.data;
  },

  /**
   * Détails transport pour un enfant spécifique.
   */
  async getChild(parentUserId: number, studentId: number): Promise<ChildTransportInfo> {
    const res = await apiClient.get<ChildTransportInfo>(
      `/parent-portal/transport/children/${studentId}?parentUserId=${parentUserId}`,
    );
    return res.data;
  },

  /**
   * ETA (en minutes) du bus à l'arrêt de l'enfant.
   */
  async getEta(parentUserId: number, studentId: number): Promise<number | null> {
    const res = await apiClient.get<number>(
      `/parent-portal/transport/children/${studentId}/eta?parentUserId=${parentUserId}`,
    );
    return res.data ?? null;
  },

  /**
   * Résumé de présence (statistiques) pour l'enfant — par défaut sur le
   * dernier mois si startDate / endDate ne sont pas fournis.
   */
  async getAttendanceSummary(
    parentUserId: number,
    studentId: number,
    options?: { startDate?: string; endDate?: string },
  ): Promise<AttendanceSummary> {
    const qs = new URLSearchParams({ parentUserId: String(parentUserId) });
    if (options?.startDate) qs.append('startDate', options.startDate);
    if (options?.endDate) qs.append('endDate', options.endDate);
    const res = await apiClient.get<AttendanceSummary>(
      `/parent-portal/transport/children/${studentId}/attendance/summary?${qs}`,
    );
    return res.data;
  },

  /**
   * Historique paginé des présences/absences transport.
   */
  async getAttendanceHistory(
    parentUserId: number,
    studentId: number,
    options?: { startDate?: string; endDate?: string; page?: number; size?: number },
  ): Promise<SpringPage<TransportAttendance>> {
    const qs = new URLSearchParams({ parentUserId: String(parentUserId) });
    if (options?.startDate) qs.append('startDate', options.startDate);
    if (options?.endDate) qs.append('endDate', options.endDate);
    qs.append('page', String(options?.page ?? 0));
    qs.append('size', String(options?.size ?? 20));
    const res = await apiClient.get<SpringPage<TransportAttendance>>(
      `/parent-portal/transport/children/${studentId}/attendance?${qs}`,
    );
    return res.data;
  },
};
