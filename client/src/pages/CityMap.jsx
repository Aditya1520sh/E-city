import React, { useState, useEffect } from 'react';
import UserLayout from '../layouts/UserLayout';
import { MapPin, Navigation, Search, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import axios from '../utils/axios';

const CityMap = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [blinkingLocation, setBlinkingLocation] = useState(null);
    const [locations, setLocations] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locationsRes, issuesRes] = await Promise.all([
                    axios.get('/locations'),
                    axios.get('/issues')
                ]);
                
                // Format locations to include lat/lng
                const formattedLocations = locationsRes.data.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    lat: loc.latitude,
                    lng: loc.longitude,
                    type: loc.type || 'general',
                    address: loc.address
                }));
                
                setLocations(formattedLocations);
                setIssues(issuesRes.data);
            } catch (error) {
                console.error('Error fetching map data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Calculate center from locations, or use default
    const centerLat = locations.length > 0 
        ? locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length 
        : 28.6159;
    const centerLng = locations.length > 0 
        ? locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length 
        : 77.2190;
    const zoom = 14;

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Get issues with locations
    const issuesWithLocations = issues.filter(issue => 
        issue.location && typeof issue.location === 'string'
    ).map(issue => {
        // Try to match issue location string with actual locations
        const matchedLocation = locations.find(loc => 
            issue.location.toLowerCase().includes(loc.name.toLowerCase())
        );
        return matchedLocation ? { ...issue, ...matchedLocation, isIssue: true } : null;
    }).filter(Boolean);

    const getLocationTypeColor = (type, isIssue = false) => {
        if (isIssue) {
            return '#ef4444'; // Red for issues
        }
        const colors = {
            residential: '#3b82f6',
            commercial: '#f59e0b',
            park: '#16a34a',
            road: '#6b7280',
            educational: '#8b5cf6',
            industrial: '#dc2626',
            healthcare: '#ec4899',
            transport: '#14b8a6',
            general: '#6366f1'
        };
        return colors[type] || '#6b7280';
    };

    if (loading) {
        return (
            <UserLayout>
                <div className="flex items-center justify-center h-[600px]">
                    <div className="text-gray-600 dark:text-gray-400">Loading map...</div>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">City Map</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Explore locations across the city using OpenStreetMap.
                </p>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Map Container */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <div className="relative w-full h-[600px] rounded-xl overflow-hidden">
                    {/* OpenStreetMap iframe with multiple markers */}
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.02},${centerLat - 0.015},${centerLng + 0.02},${centerLat + 0.015}&layer=mapnik`}
                        style={{ border: 0 }}
                        title="OpenStreetMap"
                    />

                    {/* Custom Location Markers Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                        {/* Regular Locations */}
                        {filteredLocations.map((location) => {
                            // Convert lat/lng to approximate pixel positions
                            // This is a simple projection for demonstration
                            const mapWidth = 100;
                            const mapHeight = 100;
                            
                            // Normalize coordinates relative to the visible bbox
                            const minLng = centerLng - 0.02;
                            const maxLng = centerLng + 0.02;
                            const minLat = centerLat - 0.015;
                            const maxLat = centerLat + 0.015;
                            
                            const x = ((location.lng - minLng) / (maxLng - minLng)) * mapWidth;
                            const y = ((maxLat - location.lat) / (maxLat - minLat)) * mapHeight;
                            
                            const isBlinking = blinkingLocation === location.id;
                            
                            return (
                                <g key={location.id} className="pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity">
                                    {/* Pulsing circle */}
                                    <circle
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="15"
                                        fill={getLocationTypeColor(location.type)}
                                        opacity="0.2"
                                        className={isBlinking ? "animate-ping" : ""}
                                    />
                                    {/* Extra blink effect */}
                                    {isBlinking && (
                                        <>
                                            <circle
                                                cx={`${x}%`}
                                                cy={`${y}%`}
                                                r="20"
                                                fill={getLocationTypeColor(location.type)}
                                                opacity="0.4"
                                                className="animate-ping"
                                            />
                                            <circle
                                                cx={`${x}%`}
                                                cy={`${y}%`}
                                                r="25"
                                                fill={getLocationTypeColor(location.type)}
                                                opacity="0.3"
                                                className="animate-ping"
                                                style={{ animationDelay: '0.2s' }}
                                            />
                                        </>
                                    )}
                                    {/* Marker pin */}
                                    <circle
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r={isBlinking ? "10" : "8"}
                                        fill={getLocationTypeColor(location.type)}
                                        stroke="white"
                                        strokeWidth={isBlinking ? "3" : "2"}
                                        className={isBlinking ? "animate-pulse" : ""}
                                    />
                                    {/* Label */}
                                    <text
                                        x={`${x}%`}
                                        y={`${y + 3}%`}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize={isBlinking ? "12" : "10"}
                                        fontWeight="bold"
                                        className="drop-shadow-lg"
                                    >
                                        {location.name}
                                    </text>
                                </g>
                            );
                        })}
                        
                        {/* Issue Markers */}
                        {issuesWithLocations.map((issue) => {
                            const mapWidth = 100;
                            const mapHeight = 100;
                            
                            const minLng = centerLng - 0.02;
                            const maxLng = centerLng + 0.02;
                            const minLat = centerLat - 0.015;
                            const maxLat = centerLat + 0.015;
                            
                            const x = ((issue.lng - minLng) / (maxLng - minLng)) * mapWidth;
                            const y = ((maxLat - issue.lat) / (maxLat - minLat)) * mapHeight;
                            
                            return (
                                <g key={`issue-${issue.id}`} className="pointer-events-auto cursor-pointer">
                                    {/* Pulsing alert circle */}
                                    <circle
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="12"
                                        fill="#ef4444"
                                        opacity="0.3"
                                        className="animate-ping"
                                    />
                                    {/* Alert icon background */}
                                    <circle
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="8"
                                        fill="#ef4444"
                                        stroke="white"
                                        strokeWidth="2"
                                    />
                                    {/* Exclamation mark */}
                                    <text
                                        x={`${x}%`}
                                        y={`${y + 1}%`}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize="10"
                                        fontWeight="bold"
                                    >
                                        !
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Overlay Controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2" style={{ zIndex: 20 }}>
                        <a 
                            href={`https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}&zoom=${zoom + 1}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ZoomIn size={20} className="text-gray-600 dark:text-gray-400" />
                        </a>
                        <a 
                            href={`https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}&zoom=${zoom - 1}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ZoomOut size={20} className="text-gray-600 dark:text-gray-400" />
                        </a>
                        <a 
                            href={`https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}&zoom=${zoom}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Navigation size={20} className="text-gray-600 dark:text-gray-400" />
                        </a>
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-slate-700 max-w-xs">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Legend</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-500" />
                                <span className="text-gray-600 dark:text-gray-400">Active Issue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-blue-500" />
                                <span className="text-gray-600 dark:text-gray-400">City Location</span>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                            <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Location Types</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                                    <span className="text-gray-600 dark:text-gray-400">Residential</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
                                    <span className="text-gray-600 dark:text-gray-400">Commercial</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#16a34a' }}></div>
                                    <span className="text-gray-600 dark:text-gray-400">Park</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#14b8a6' }}></div>
                                    <span className="text-gray-600 dark:text-gray-400">Transport</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
                                    <span className="text-gray-600 dark:text-gray-400">Educational</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ec4899' }}></div>
                                    <span className="text-gray-600 dark:text-gray-400">Healthcare</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* City Badge */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg px-4 py-2">
                        <div className="text-lg font-bold">E-City</div>
                        <div className="text-xs opacity-90">
                            {locations.length} Locations • {issuesWithLocations.length} Issues
                        </div>
                    </div>
                </div>

                {/* Location List */}
                <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Locations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredLocations.map((location) => (
                            <div
                                key={location.id}
                                onClick={() => {
                                    setSelectedLocation(location);
                                    setBlinkingLocation(location.id);
                                    // Stop blinking after 3 seconds
                                    setTimeout(() => setBlinkingLocation(null), 3000);
                                    // Scroll to map
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                    blinkingLocation === location.id 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105' 
                                        : 'border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                            blinkingLocation === location.id ? 'animate-pulse scale-110' : ''
                                        }`}
                                        style={{ backgroundColor: getLocationTypeColor(location.type) }}
                                    >
                                        <MapPin size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">{location.name}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{location.type}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* External Map Link */}
                <div className="mt-6 text-center">
                    <a
                        href={`https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}#map=${zoom}/${centerLat}/${centerLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <MapPin size={20} />
                        Open in OpenStreetMap
                    </a>
                </div>
            </div>
        </UserLayout>
    );
};

export default CityMap;
