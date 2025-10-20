// Determine API base URL with production fallback
const getApiBaseUrl = () => {
  // In production, try to use the backend URL from environment
  if (process.env.NODE_ENV === 'production') {
    // If no backend URL is configured, show a helpful error
    if (!process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL.includes('localhost')) {
      console.error('❌ Production backend URL not configured. Please set REACT_APP_API_URL environment variable.');
      // Return a placeholder that will cause requests to fail gracefully
      return 'https://backend-not-configured.example.com';
    }
  }
  
  return (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified: boolean;
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
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const loginResponse: LoginResponse = await response.json();
      
      // Store the JWT token
      this.accessToken = loginResponse.access_token;
      localStorage.setItem('access_token', this.accessToken);
      
      return loginResponse.user;
    } catch (error) {
      console.error('Backend login failed:', error);
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