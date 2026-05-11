import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '../config/env';
import { storage } from '../utils/storage';
import type { ApiResponse } from '../types/api';

type UnauthorizedHandler = () => void;

class ApiClient {
  private instance: AxiosInstance;
  private onUnauthorized: UnauthorizedHandler | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: env.apiBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.instance.interceptors.request.use(async (config) => {
      const token = await storage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && this.onUnauthorized) {
          this.onUnauthorized();
        }
        const data = error.response?.data;
        if (data) {
          const backendMessage =
            data.errorMessage ||
            data.message ||
            data.error ||
            (typeof data === 'object' ? Object.values(data).join('. ') : null);
          if (backendMessage) {
            error.message = backendMessage;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
    this.onUnauthorized = handler;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.get<ApiResponse<T>>(url, config);
    return res.data;
  }

  /**
   * GET sans déballage du wrapper ApiResponse.
   * À utiliser pour les endpoints qui renvoient directement le payload brut
   * (ex: ParentPortailPedagogiqueController qui renvoie `ResponseEntity<List<...>>`).
   */
  async getRaw<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.get<T>(url, config);
    return res.data;
  }

  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.post<ApiResponse<T>>(url, body, config);
    return res.data;
  }

  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.put<ApiResponse<T>>(url, body, config);
    return res.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.delete<ApiResponse<T>>(url, config);
    return res.data;
  }

  async uploadFile<T>(
    url: string,
    formData: FormData,
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<T>> {
    const res = await this.instance.post<ApiResponse<T>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return res.data;
  }

  async getBlobUrl(url: string): Promise<{ data: ArrayBuffer; contentType: string }> {
    const res: AxiosResponse<ArrayBuffer> = await this.instance.get(url, {
      responseType: 'arraybuffer',
    });
    return {
      data: res.data,
      contentType: (res.headers['content-type'] as string) || 'application/octet-stream',
    };
  }

  getBaseUrl(): string {
    return env.apiBaseUrl;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await storage.getToken();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }
}

export const apiClient = new ApiClient();
