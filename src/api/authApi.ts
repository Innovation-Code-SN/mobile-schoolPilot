import { apiClient } from './client';
import type { LoginRequest, LoginResponse, UserInfo } from '../types/auth';
import type {
  ChangePasswordRequest,
  RegisterParentRequest,
  RegisterParentResponse,
} from '../types/preRegistration';

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/auth/login', data);
    if (res.success && res.data) return res.data;
    throw new Error(res.errorMessage || res.message || 'Échec de la connexion');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore server-side failure, caller clears local storage
    }
  },

  async getCurrentUser(): Promise<UserInfo> {
    const res = await apiClient.get<UserInfo>('/auth/me');
    if (res.success && res.data) return res.data;
    throw new Error(res.errorMessage || 'Impossible de récupérer l\'utilisateur');
  },

  async updateProfile(data: { firstName: string; lastName: string; phone?: string }): Promise<UserInfo> {
    const res = await apiClient.put<UserInfo>('/auth/profile', data);
    if (res.success && res.data) return res.data;
    throw new Error(res.errorMessage || 'Échec de la mise à jour');
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const res = await apiClient.post('/auth/change-password', data);
    if (!res.success) {
      throw new Error(res.errorMessage || res.message || 'Échec du changement de mot de passe');
    }
  },

  async registerParent(data: RegisterParentRequest): Promise<RegisterParentResponse> {
    const res = await apiClient.post<RegisterParentResponse>('/public/parent/register', data);
    if (res.success && res.data) return res.data;
    throw new Error(res.errorMessage || res.message || 'Échec de l\'inscription');
  },

  async forgotPassword(email: string): Promise<void> {
    const res = await apiClient.post('/auth/forgot-password', { email });
    if (!res.success) {
      throw new Error(res.errorMessage || res.message || 'Échec de l\'envoi du lien');
    }
  },

  async checkEmailAvailability(email: string): Promise<boolean> {
    const res = await apiClient.get<boolean>(
      `/public/parent/check-email?email=${encodeURIComponent(email)}`
    );
    return res.data === true;
  },
};
