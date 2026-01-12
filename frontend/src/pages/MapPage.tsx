import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapMarker } from '../types/api';
import { mapService } from '../services/mapService';
import L from 'leaflet';
import '../styles/pages/MapPage.css';

// Fix for default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapPage: React.FC = () => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarkers();
  }, []);

  const loadMarkers = async () => {
    try {
      const data = await mapService.getMarkers();
      setMarkers(data);
    } catch (err) {
      console.error('Failed to load markers', err);
      setError('Failed to load map data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Center of Texas
  const centerPosition: [number, number] = [31.9686, -99.9018];
  
  // Bounds for Texas and neighboring regions
  // South-West: [24.0, -108.0], North-East: [38.0, -92.0]
  const texasBounds: [[number, number], [number, number]] = [
    [24.0, -108.0],
    [38.0, -92.0]
  ];

  return (
    <div className="map-page enhanced">
      <div className="map-header">
        <h1>Community Map</h1>
        <p>Explore invasive plant sightings reported by the community.</p>
      </div>

      <div className="map-container-wrapper">
        {loading ? (
          <div className="loading-map">Loading map data...</div>
        ) : error ? (
          <div className="error-map">{error}</div>
        ) : (
          <MapContainer 
            center={centerPosition} 
            zoom={6} 
            minZoom={5}
            maxBounds={texasBounds}
            maxBoundsViscosity={1.0}
            scrollWheelZoom={true} 
            className="leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
              <Marker key={marker.id} position={[marker.latitude, marker.longitude]}>
                <Popup>
                  <div className="marker-popup">
                    <h3>{marker.plant_name}</h3>
                    <div className={`status-badge ${marker.is_invasive ? 'invasive' : 'native'}`}>
                      {marker.is_invasive ? 'Invasive' : 'Native'}
                    </div>
                    <p>Reported by: {marker.user_name}</p>
                    <p>Date: {new Date(marker.timestamp).toLocaleDateString()}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapPage;
