"""
Map Markers Management Module

This module handles map marker storage and retrieval.
"""

import json
import os
import uuid
from typing import Dict, List, Optional
from datetime import datetime
from app.schemas import MapMarker, CreateMarkerRequest

class MapManager:
    def __init__(self, storage_file: str = "map_markers.json"):
        self.storage_file = storage_file
        self.markers: List[Dict] = []
        self.load_markers()

    def load_markers(self):
        """Load markers from JSON file"""
        try:
            if os.path.exists(self.storage_file):
                with open(self.storage_file, 'r') as f:
                    data = json.load(f)
                    self.markers = data
        except Exception as e:
            print(f"Error loading markers: {e}")
            self.markers = []

    def save_markers(self):
        """Save markers to JSON file"""
        try:
            with open(self.storage_file, 'w') as f:
                json.dump(self.markers, f, default=str, indent=2)
        except Exception as e:
            print(f"Error saving markers: {e}")

    def add_marker(self, user_id: str, user_name: str, marker_data: CreateMarkerRequest) -> Optional[MapMarker]:
        """Add a new marker to the map"""
        try:
            # Texas Boundaries
            TEXAS_MIN_LAT = 25.837164
            TEXAS_MAX_LAT = 36.500704
            TEXAS_MIN_LON = -106.646641
            TEXAS_MAX_LON = -93.508039

            if not (TEXAS_MIN_LAT <= marker_data.latitude <= TEXAS_MAX_LAT and 
                    TEXAS_MIN_LON <= marker_data.longitude <= TEXAS_MAX_LON):
                raise ValueError("Location is outside of Texas. Markers can only be placed within Texas.")

            marker_id = str(uuid.uuid4())
            timestamp = datetime.now()
            
            new_marker = MapMarker(
                id=marker_id,
                user_id=user_id,
                user_name=user_name,
                latitude=marker_data.latitude,
                longitude=marker_data.longitude,
                plant_name=marker_data.plant_name,
                is_invasive=marker_data.is_invasive,
                timestamp=timestamp,
                scan_id=marker_data.scan_id
            )
            
            # Convert to dict for storage
            marker_dict = new_marker.dict()
            self.markers.append(marker_dict)
            self.save_markers()
            
            return new_marker
        except ValueError:
            # Re-raise ValueError for API handling
            raise
        except Exception as e:
            print(f"Error adding marker: {e}")
            return None

    def get_all_markers(self) -> List[MapMarker]:
        """Get all map markers"""
        try:
            markers_list = []
            for m in self.markers:
                # Handle datetime conversion if needed
                if isinstance(m.get('timestamp'), str):
                    m['timestamp'] = datetime.fromisoformat(m['timestamp'].replace('Z', '+00:00'))
                markers_list.append(MapMarker(**m))
            return markers_list
        except Exception as e:
            print(f"Error getting markers: {e}")
            return []

# Singleton instance
map_manager = MapManager()
