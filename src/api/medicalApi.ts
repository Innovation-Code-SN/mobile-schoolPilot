// src/api/medicalApi.ts
// Endpoints médicaux côté parent.
// Côté backend : /infirmary/parent/students/{id}/medical-profile (GET/PUT)
// + sous-ressources contacts / conditions / medications / vaccinations / authorizations (POST/PUT/DELETE)
// + /infirmary/visits/parent/students/{id} (GET)
//
// Permission : PARENT_VIEW_INFIRMARY.
import { apiClient } from './client';
import type {
  CompleteMedicalProfile,
  StudentMedicalAuthorizationGrant,
  StudentMedicalContact,
  StudentMedicalProfile,
} from '../types/medical';
import type { InfirmaryVisit } from '../types/infirmary';

const base = (studentId: number) =>
  `/infirmary/parent/students/${studentId}/medical-profile`;

export const medicalApi = {
  // ----- Lecture -----
  async getChildMedicalProfile(studentId: number): Promise<CompleteMedicalProfile> {
    const res = await apiClient.get<CompleteMedicalProfile>(base(studentId));
    return res.data;
  },

  async getChildInfirmaryVisits(studentId: number): Promise<InfirmaryVisit[]> {
    const res = await apiClient.get<InfirmaryVisit[]>(
      `/infirmary/visits/parent/students/${studentId}`,
    );
    return res.data;
  },

  // ----- Profil principal -----
  async upsertProfile(
    studentId: number,
    profile: StudentMedicalProfile,
  ): Promise<StudentMedicalProfile> {
    const res = await apiClient.put<StudentMedicalProfile>(base(studentId), profile);
    return res.data;
  },

  // ----- Autorisations parentales -----
  /**
   * Active/refuse une autorisation parentale. Le backend décide si une
   * entrée existe déjà ou pas (upsert).
   */
  async setAuthorization(
    studentId: number,
    grant: StudentMedicalAuthorizationGrant,
  ): Promise<StudentMedicalAuthorizationGrant> {
    const res = await apiClient.put<StudentMedicalAuthorizationGrant>(
      `${base(studentId)}/authorizations`,
      grant,
    );
    return res.data;
  },

  // ----- Contacts médicaux -----
  async addContact(
    studentId: number,
    contact: StudentMedicalContact,
  ): Promise<StudentMedicalContact> {
    const res = await apiClient.post<StudentMedicalContact>(
      `${base(studentId)}/contacts`,
      contact,
    );
    return res.data;
  },

  async deleteContact(studentId: number, contactId: number): Promise<void> {
    await apiClient.delete(`${base(studentId)}/contacts/${contactId}`);
  },
};
