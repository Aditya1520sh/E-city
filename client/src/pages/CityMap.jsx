import React, { useState, useEffect } from 'react';
import UserLayout from '../layouts/UserLayout';
import MapComponent from '../components/MapComponent';
import { useToast } from '../context/ToastContext';
import { MapPin, ArrowLeft, Info, Phone, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const CityMap = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState({
    hospital: true,
    school: true,
    community_center: true,
    mcd_office: true,
    landmark: true
  });
  const { showToast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [locations, selectedTypes]);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE + '/locations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      showToast('Error fetching locations', 'error');
    }
  };

  const filterLocations = () => {
    const filtered = locations.filter(loc => selectedTypes[loc.type]);
    setFilteredLocations(filtered);
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const handleBackToFilters = () => {
    setSelectedLocation(null);
  };

  const locationTypes = [
    { id: 'hospital', label: 'Hospitals', color: 'text-red-600' },
    { id: 'school', label: 'Schools', color: 'text-yellow-600' },
    { id: 'community_center', label: 'Community Centers', color: 'text-green-600' },
    { id: 'mcd_office', label: 'MCD Offices', color: 'text-blue-600' },
    { id: 'landmark', label: 'Landmarks', color: 'text-purple-600' }
  ];

  return (
    <UserLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">City Map</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Explore city landmarks, parks, and offices.</p>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          <span>{isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}</span>
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px] relative">
        {/* Sidebar / Filter Panel */}
        <div className={`${isSidebarOpen ? 'w-full lg:w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden p-0 border-0'} transition-all duration-300 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-y-auto`}>
          {selectedLocation ? (
            <div className="animate-fadeIn">
              <button 
                onClick={handleBackToFilters} 
                className="mb-4 text-blue-600 dark:text-blue-400 text-sm flex items-center hover:underline"
              >
                 <ArrowLeft size={16} className="mr-1" /> Back to Filters
              </button>
              
              {selectedLocation.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden h-48 bg-gray-100 dark:bg-slate-700">
                  <img 
                    src={selectedLocation.imageUrl} 
                    alt={selectedLocation.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                </div>
              )}

              <div className="mb-4">
                <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{selectedLocation.name}</h2>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                  locationTypes.find(t => t.id === selectedLocation.type)?.color.replace('text-', 'bg-').replace('600', '100') + ' ' + 
                  locationTypes.find(t => t.id === selectedLocation.type)?.color 
                } bg-opacity-20`}>
                  {locationTypes.find(t => t.id === selectedLocation.type)?.label || selectedLocation.type}
                </span>
              </div>
              
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                {selectedLocation.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200">Address</p>
                      <p>{selectedLocation.address}</p>
                    </div>
                  </div>
                )}
                
                {selectedLocation.contact && (
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200">Contact</p>
                      <p>{selectedLocation.contact}</p>
                    </div>
                  </div>
                )}

                {selectedLocation.description && (
                  <div className="flex items-start gap-3">
                    <Info size={18} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200">Description</p>
                      <p>{selectedLocation.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">Filters</h2>
              <div className="space-y-3">
                {locationTypes.map((type) => (
                  <label key={type.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedTypes[type.id]}
                      onChange={() => handleTypeToggle(type.id)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`font-medium ${type.color} dark:text-gray-200`}>{type.label}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Stats</h3>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {filteredLocations.length} locations
                </div>
              </div>
            </>
          )}
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 relative z-0 transition-all duration-300">
          <MapComponent 
            locations={filteredLocations} 
            height="100%" 
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>
    </UserLayout>
  );
};

export default CityMap;
