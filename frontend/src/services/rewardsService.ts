import { authService } from './authService';

// Determine API base URL with production fallback (duplicated from collectionService to avoid circular deps or complex refactoring)
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL.includes('localhost')) {
      return 'https://backend-not-configured.example.com';
    }
  }
  return (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();

interface RewardsResponse {
  coins: number;
  awarded_species: string[];
}

export const rewardsService = {
  async getRewards(): Promise<RewardsResponse> {
    const token = authService.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    // Add timestamp to prevent caching
    const res = await fetch(`${API_BASE_URL}/api/rewards?t=${Date.now()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch rewards: ${res.status}`);
    return (await res.json()) as RewardsResponse;
  },
};
