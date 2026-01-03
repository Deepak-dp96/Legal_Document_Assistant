// API Configuration and Base Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  timestamp?: string;
  documents?: any[];
}

export interface PaginationMeta {
  current: number;
  pages: number;
  total: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  next: number | null;
  prev: number | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta?: {
    pagination: PaginationMeta;
  };
}

// HTTP Client Class
export class ApiClient {
  public readonly baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private refreshHandler: (() => Promise<string | null>) | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('deeplex_token');
    this.refreshToken = localStorage.getItem('deeplex_refresh_token');
  }

  private getHeaders(): HeadersInit {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  private async request<T>(method: string, endpoint: string, body?: any, params?: Record<string, any>, isRetry: boolean = false): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }

    const headers = this.getHeaders();
    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    // Special handling for file uploads
    if (body instanceof FormData) {
      delete (headers as any)['Content-Type'];
      config.body = body;
    }

    let response = await fetch(url.toString(), config);

    // Handle 401 Unauthorized with Token Refresh
    if (response.status === 401 && !isRetry && this.refreshHandler && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      console.log('Token expired, attempting refresh...');
      const newToken = await this.refreshHandler();

      if (newToken) {
        console.log('Token refreshed, retrying request...');
        // Update headers with new token
        (headers as any).Authorization = `Bearer ${newToken}`;
        config.headers = headers;
        response = await fetch(url.toString(), config);
      } else {
        console.warn('Token refresh failed');
        this.clearToken();
      }
    }

    return this.handleResponse<T>(response);
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, params);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }

  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>, fileFieldName: string = 'document'): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fileFieldName, file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, JSON.stringify(additionalData[key]));
      });
    }

    return this.request<T>('POST', endpoint, formData);
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('deeplex_token', token);
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
    localStorage.setItem('deeplex_refresh_token', token);
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearToken(): void {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('deeplex_token');
    localStorage.removeItem('deeplex_refresh_token');
  }

  setRefreshHandler(handler: () => Promise<string | null>): void {
    this.refreshHandler = handler;
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// API Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API call wrapper with error handling
export async function apiCall<T>(
  apiFunction: () => Promise<ApiResponse<T>>
): Promise<T> {
  try {
    const response = await apiFunction();
    if (!response) {
      throw new ApiError("No response received", undefined, []);
    }
    return response.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}