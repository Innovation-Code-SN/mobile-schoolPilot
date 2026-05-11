import { apiClient } from './client';
import type {
  AcademicYearRef,
  ChildDetail,
  ChildSummary,
  LevelRef,
  Parent,
  ParentDashboard,
  ParentInvitation,
  ParentInvoice,
  ParentPayment,
  PreRegistrationDetail,
  PreRegistrationDocument,
  PreRegistrationSummary,
  SchoolService,
  UpdateParentProfileDto,
} from '../types/parent';
import type { PreRegistrationFormData } from '../types/preRegistration';

export const parentApi = {
  async getDashboard(): Promise<ParentDashboard> {
    const res = await apiClient.get<ParentDashboard>('/parent/dashboard');
    return res.data;
  },

  async getChildren(): Promise<ChildSummary[]> {
    const res = await apiClient.get<ChildSummary[]>('/parent/children');
    return res.data;
  },

  async getChildDetails(childId: number): Promise<ChildDetail> {
    const res = await apiClient.get<ChildDetail>(`/parent/children/${childId}`);
    return res.data;
  },

  async getProfile(): Promise<Parent> {
    const res = await apiClient.get<Parent>('/parent/profile');
    return res.data;
  },

  async updateProfile(data: UpdateParentProfileDto): Promise<void> {
    await apiClient.put('/parent/profile', data);
  },

  async getPreRegistrations(): Promise<PreRegistrationSummary[]> {
    const res = await apiClient.get<PreRegistrationSummary[]>('/parent/preregistrations');
    return res.data;
  },

  async getPreRegistrationDetails(id: number): Promise<PreRegistrationDetail> {
    const res = await apiClient.get<PreRegistrationDetail>(`/parent/preregistrations/${id}`);
    return res.data;
  },

  async createPreRegistration(data: PreRegistrationFormData): Promise<{ id: number }> {
    const res = await apiClient.post<{ id: number }>('/parent/preregistrations', data);
    if (res.success && res.data) return res.data;
    throw new Error(res.errorMessage || res.message || 'Échec de la création');
  },

  async updatePreRegistration(id: number, data: PreRegistrationFormData): Promise<{ id: number }> {
    const res = await apiClient.put<{ id: number }>(`/parent/preregistrations/${id}`, data);
    if (res.success && res.data) return res.data;
    throw new Error(res.errorMessage || res.message || 'Échec de la modification');
  },

  async getPreRegistrationDocuments(id: number): Promise<PreRegistrationDocument[]> {
    const res = await apiClient.get<PreRegistrationDocument[]>(
      `/parent/preregistrations/${id}/documents`
    );
    return res.data;
  },

  async uploadPreRegistrationDocument(
    preRegistrationId: number,
    file: { uri: string; name: string; mimeType: string },
    documentType: string,
    notes?: string
  ): Promise<unknown> {
    const formData = new FormData();
    // @ts-expect-error React Native FormData file format
    formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType });
    formData.append('documentType', documentType);
    if (notes) formData.append('notes', notes);

    const res = await apiClient.uploadFile<unknown>(
      `/parent/preregistrations/${preRegistrationId}/documents`,
      formData
    );
    return res.data;
  },

  async deletePreRegistrationDocument(
    preRegistrationId: number,
    documentId: number
  ): Promise<void> {
    await apiClient.delete(
      `/parent/preregistrations/${preRegistrationId}/documents/${documentId}`
    );
  },

  async getAllInvoices(): Promise<ParentInvoice[]> {
    const res = await apiClient.get<ParentInvoice[]>('/parent/invoices');
    return res.data;
  },

  async getAllPayments(): Promise<ParentPayment[]> {
    const res = await apiClient.get<ParentPayment[]>('/parent/payments');
    return res.data;
  },

  async getAcademicYears(): Promise<AcademicYearRef[]> {
    const res = await apiClient.get<AcademicYearRef[]>('/parent/academic-years');
    return res.data;
  },

  async getAvailableLevels(): Promise<LevelRef[]> {
    const res = await apiClient.get<LevelRef[]>('/parent/levels');
    return res.data;
  },

  async getAvailableServices(): Promise<SchoolService[]> {
    const res = await apiClient.get<SchoolService[]>('/parent/school-services/available');
    return res.data ?? [];
  },

  async getSentInvitations(): Promise<ParentInvitation[]> {
    const res = await apiClient.get<ParentInvitation[]>('/parent/invitations/sent');
    return res.data;
  },

  async getReceivedInvitations(): Promise<ParentInvitation[]> {
    const res = await apiClient.get<ParentInvitation[]>('/parent/invitations/received');
    return res.data;
  },

  async sendInvitation(data: {
    recipientEmail: string;
    recipientName?: string;
    childId?: number;
    relationType?: string;
    isEmergencyContact?: boolean;
    isAuthorizedPickup?: boolean;
    isFinanciallyResponsible?: boolean;
  }): Promise<ParentInvitation> {
    const res = await apiClient.post<ParentInvitation>('/parent/invitations', data);
    return res.data;
  },

  async acceptInvitation(token: string): Promise<void> {
    await apiClient.post(`/parent/invitations/${token}/accept`);
  },

  async rejectInvitation(token: string): Promise<void> {
    await apiClient.post(`/parent/invitations/${token}/reject`);
  },

  async cancelInvitation(invitationId: number): Promise<void> {
    await apiClient.delete(`/parent/invitations/${invitationId}`);
  },
};
