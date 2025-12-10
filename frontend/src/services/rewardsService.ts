import { authService } from './authService';

interface RewardsResponse {
  coins: number;
  awarded_species: string[];
}

export const rewardsService = {
  async getRewards(): Promise<RewardsResponse> {
    const token = authService.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/rewards', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch rewards: ${res.status}`);
    return (await res.json()) as RewardsResponse;
  },
};

