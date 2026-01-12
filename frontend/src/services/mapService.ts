import { API_BASE_URL } from '../config/api';
import { CreateMarkerRequest, MapMarker } from '../types/api';
import { authService } from './authService';

export const mapService = {
  async getMarkers(): Promise<MapMarker[]> {
    try {
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/api/map/markers`);

      if (!response.ok) {
        throw new Error('Failed to fetch markers');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching markers:', error);
      throw error;
    }
  },

  async addMarker(markerData: CreateMarkerRequest): Promise<MapMarker> {
    try {
      const response = await authService.authenticatedFetch(`${API_BASE_URL}/api/map/markers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(markerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to add marker');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding marker:', error);
      throw error;
    }
  },
};
