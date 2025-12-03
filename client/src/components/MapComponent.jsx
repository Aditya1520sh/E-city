import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin, AlertTriangle, CheckCircle, Clock, Construction, Trash2, Zap, HelpCircle } from 'lucide-react';

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

const getMarkerIcon = (loc) => {
  let icon = <MapPin size={24} fill="currentColor" />;
  let color = '#3b82f6'; // blue-500 default

  // Handle Issues by Type (Category)
  if (loc.type && loc.type.startsWith('issue_')) {
    switch (loc.type) {
      case 'issue_infrastructure':
        icon = <Construction size={24} fill="currentColor" />;
        color = '#f97316'; // orange-500
        break;
      case 'issue_sanitation':
        icon = <Trash2 size={24} fill="currentColor" />;
        color = '#854d0e'; // yellow-800 (brownish)
        break;
      case 'issue_electricity':
        icon = <Zap size={24} fill="currentColor" />;
        color = '#eab308'; // yellow-500
        break;
      case 'issue_other':
        icon = <HelpCircle size={24} fill="currentColor" />;
        color = '#6b7280'; // gray-500
        break;
      default:
        icon = <AlertTriangle size={24} fill="currentColor" />;
        color = '#ef4444'; // red-500
    }
  }
  // Handle Landmarks (existing types)
  else if (loc.type) {
    switch (loc.type) {
      case 'hospital': color = '#dc2626'; break; // red-600
      case 'school': color = '#ca8a04'; break; // yellow-600
      case 'community_center': color = '#16a34a'; break; // green-600
      case 'mcd_office': color = '#2563eb'; break; // blue-600
      case 'landmark': color = '#9333ea'; break; // purple-600
      default: color = '#4b5563'; // gray-600
    }
  }

  const html = renderToStaticMarkup(
    <div style={{ color: color, filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}>
      {icon}
    </div>
  );

  return L.divIcon({
    className: 'custom-marker-icon',
    html: html,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -28]
  });
};

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
        {locations.map((loc) => {
          // Ensure valid coordinates
          const lat = loc.latitude || (loc.location && parseFloat(loc.location.split(',')[0].split(':')[1]));
          const lng = loc.longitude || (loc.location && parseFloat(loc.location.split(',')[1].split(':')[1]));

          // Fallback for issues that might store location as string "Lat: 12.34, Long: 56.78"
          // If we can't parse coordinates, skip rendering
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={loc.id}
              position={[lat, lng]}
              icon={getMarkerIcon(loc)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(loc);
                },
              }}
            >
              <Popup>
                <strong>{loc.name || loc.title}</strong> <br />
                {loc.status && (
                  <span className={`text-xs font-bold uppercase ${loc.status === 'resolved' ? 'text-green-600' :
                    loc.status === 'in-progress' ? 'text-yellow-600' : 'text-orange-600'
                    }`}>
                    {loc.status}
                  </span>
                )}
                {!loc.status && (loc.type || loc.category)} <br />
                <span className="text-xs line-clamp-2">{loc.description}</span>
              </Popup>
            </Marker>
          );
        })}
        {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} />}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
