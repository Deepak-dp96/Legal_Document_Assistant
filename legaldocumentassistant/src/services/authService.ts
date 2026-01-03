import { apiClient, apiCall, ApiResponse } from './api';

// Auth Types
export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  lastLogin?: string;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
    };
    theme: 'light' | 'dark';
  };
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export interface UpdateProfileData {
  full_name?: string;
  email?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
    theme?: 'light' | 'dark';
  };
}

// Auth Service Class
class AuthService {
  private refreshTimer: any = null;

  constructor() {
    // Register refresh handler with API client
    apiClient.setRefreshHandler(() => this.refreshToken());

    // Check if we should start timer on load
    if (this.isAuthenticated()) {
      this.startRefreshTimer();
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiCall<AuthResponse>(() =>
      apiClient.post<AuthResponse>('/auth/login', {
        ...credentials,
        username: credentials.email
      })
    );

    // Store token in API client
    apiClient.setToken(response.token);
    apiClient.setRefreshToken(response.refresh_token);

    // Start refresh timer
    this.startRefreshTimer();

    return response;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiCall<AuthResponse>(() =>
      apiClient.post<AuthResponse>('/auth/register', userData)
    );

    // Store token in API client
    apiClient.setToken(response.token);
    apiClient.setRefreshToken(response.refresh_token);

    // Start refresh timer
    this.startRefreshTimer();

    return response;
  }

  async getCurrentUser(): Promise<User> {
    return apiCall<{ user: User }>(() =>
      apiClient.get<{ user: User }>('/auth/me')
    ).then(data => data.user);
  }

  async updateProfile(updateData: UpdateProfileData): Promise<User> {
    return apiCall<{ user: User }>(() =>
      apiClient.put<{ user: User }>('/auth/profile', updateData)
    ).then(data => data.user);
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear token and stop timer
      apiClient.clearToken();
      this.stopRefreshTimer();
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('deeplex_token');
  }

  getStoredUser(): User | null {
    const userData = localStorage.getItem('deeplex_user');
    return userData ? JSON.parse(userData) : null;
  }

  storeUser(user: User): void {
    localStorage.setItem('deeplex_user', JSON.stringify(user));
  }

  clearStoredUser(): void {
    localStorage.removeItem('deeplex_user');
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return apiCall<ApiResponse>(() =>
      apiClient.post<ApiResponse>(`/auth/forgot-password?email=${encodeURIComponent(email)}`)
    );
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return apiCall<ApiResponse>(() =>
      apiClient.post<ApiResponse>('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      })
    );
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = apiClient.getRefreshToken();
      if (!refreshToken) return null;

      const response = await apiCall<any>(() =>
        apiClient.post<any>('/auth/refresh', { refresh_token: refreshToken })
      );

      if (response && response.access_token) {
        apiClient.setToken(response.access_token);
        return response.access_token;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  startRefreshTimer() {
    this.stopRefreshTimer();
    // Refresh every 10 minutes (600000 ms)
    this.refreshTimer = setInterval(async () => {
      if (this.isAuthenticated()) {
        console.log('Auto-refreshing token...');
        await this.refreshToken();
      }
    }, 600000);
  }

  stopRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

export const authService = new AuthService();