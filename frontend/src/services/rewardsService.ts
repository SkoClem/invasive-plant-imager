import { authService } from './authService';

interface RewardsResponse {
  coins: number;
  awarded_species: string[];
}

export const rewardsService = {
  async getRewards(): Promise<RewardsResponse> {
    const token = authService.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    // Add timestamp to prevent caching
    const res = await fetch(`/api/rewards?t=${Date.now()}`, {
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
