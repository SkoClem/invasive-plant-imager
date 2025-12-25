import { API_BASE_URL } from '../config/api';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified: boolean;
    coins?: number;
  };
}

export interface AuthUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  photoURL?: string;
  displayName?: string;
  email_verified: boolean;
  coins?: number;
}

class AuthService {
  private accessToken: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.accessToken = localStorage.getItem('access_token');
  }

  /**
   * Login with Firebase ID token and get JWT from backend
   */
  async loginWithFirebaseToken(idToken: string): Promise<AuthUser> {
    try {
      console.log('🔄 Sending Firebase token to backend for authentication...');
      console.log('🔗 Backend URL:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken
        }),
      });

      console.log('📡 Backend response status:', response.status);
      console.log('📡 Backend response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend login failed with error:', errorData);
        throw new Error(errorData.detail || 'Login failed');
      }

      const loginResponse: LoginResponse = await response.json();
      console.log('✅ Backend login successful:', {
        user: loginResponse.user,
        tokenReceived: !!loginResponse.access_token
      });
      
      // Store the JWT token
      this.accessToken = loginResponse.access_token;
      localStorage.setItem('access_token', this.accessToken);
      console.log('💾 JWT token stored in localStorage');
      
      return loginResponse.user;
    } catch (error) {
      console.error('❌ Backend login failed:', error);
      console.error('Error details:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        stack: (error as any)?.stack
      });
      throw error;
    }
  }

  /**
   * Logout - clear stored tokens
   */
  logout(): void {
    this.accessToken = null;
    localStorage.removeItem('access_token');
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Get current user info from backend
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token might be expired or invalid
        this.logout();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Make authenticated API request
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, clear token and throw error
    if (response.status === 401) {
      this.logout();
      throw new Error('Authentication required');
    }

    return response;
  }
}

// Export singleton instance
export const authService = new AuthService();