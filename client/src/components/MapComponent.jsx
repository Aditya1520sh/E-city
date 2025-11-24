import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if (onLocationSelect) {
        onLocationSelect(e.latlng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
}

// Component to update map center when search result is found
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const MapComponent = ({ locations = [], onLocationSelect, onMarkerClick, center = [28.6139, 77.2090], zoom = 11, height = '400px' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        setMapZoom(15);
        if (onLocationSelect) {
           // Optional: Auto-select the searched location
           // onLocationSelect({ lat: parseFloat(lat), lng: parseFloat(lon) });
        }
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <div className="relative w-full" style={{ height: height }}>
      <div className="absolute top-2 left-2 sm:left-12 z-[1000] bg-white p-2 rounded shadow-md flex gap-2 max-w-[calc(100%-1rem)] sm:max-w-none">
        <form onSubmit={handleSearch} className="flex gap-2 w-full">
          <input 
            type="text" 
            placeholder="Search address..." 
            className="border p-1 rounded text-sm w-full sm:w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded text-sm whitespace-nowrap">Search</button>
        </form>
      </div>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.latitude, loc.longitude]}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) onMarkerClick(loc);
              },
            }}
          >
            <Popup>
              <strong>{loc.name || loc.title}</strong> <br />
              {loc.type || loc.category} <br />
              {loc.description}
            </Popup>
          </Marker>
        ))}
        {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} />}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
