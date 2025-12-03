import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import MapComponent from '../components/MapComponent';
import AdminLayout from '../layouts/AdminLayout';
import { API_BASE } from '../utils/axios';

const AdminLocations = () => {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    type: 'park', 
    latitude: 51.505, 
    longitude: -0.09, 
    address: '',
    contact: '',
    imageUrl: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

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

  const handleLocationSelect = (latlng) => {
    setFormData({
      ...formData,
      latitude: latlng.lat,
      longitude: latlng.lng
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE + '/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        showToast('Location added', 'success');
        setFormData({ ...formData, name: '', address: '', contact: '', imageUrl: '' });
        fetchLocations();
      }
    } catch (error) {
      showToast('Error adding location', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE + `/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        showToast('Location deleted', 'success');
        fetchLocations();
      }
    } catch (error) {
      showToast('Error deleting location', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">City Map & Locations</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow mb-6">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Interactive Map</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Click on the map to select coordinates for a new location.</p>
            <MapComponent 
              locations={locations} 
              onLocationSelect={handleLocationSelect}
              height="500px"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow mb-6">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Add New Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Type</label>
                <select
                  className="mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="park">Park</option>
                  <option value="office">Office</option>
                  <option value="hospital">Hospital</option>
                  <option value="school">School</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Lat</label>
                  <input
                    type="number"
                    step="any"
                    className="mt-1 block w-full border rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 text-slate-900 dark:text-white"
                    value={formData.latitude}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Lng</label>
                  <input
                    type="number"
                    step="any"
                    className="mt-1 block w-full border rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 text-slate-900 dark:text-white"
                    value={formData.longitude}
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Address</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Contact</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Image URL</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add Location
              </button>
            </div>
          </form>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow max-h-96 overflow-y-auto">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Existing Locations</h3>
            <ul className="space-y-3">
              {locations.map((loc) => (
                <li key={loc.id} className="border-b dark:border-slate-700 pb-2 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{loc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{loc.type}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="text-red-600 text-xs hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLocations;
