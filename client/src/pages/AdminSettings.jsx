import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import AdminLayout from '../layouts/AdminLayout';

const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const { showToast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE + '/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      showToast('Error fetching settings', 'error');
    }
  };

  const handleUpdate = async (key, value) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE + '/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ key, value })
      });
      if (response.ok) {
        showToast('Setting updated', 'success');
        fetchSettings();
      }
    } catch (error) {
      showToast('Error updating setting', 'error');
    }
  };

  // Default settings if none exist
  const defaultSettings = [
    { key: 'site_name', label: 'Site Name', value: 'E-City Management' },
    { key: 'maintenance_mode', label: 'Maintenance Mode', value: 'false', type: 'boolean' },
    { key: 'allow_registration', label: 'Allow User Registration', value: 'true', type: 'boolean' },
    { key: 'contact_email', label: 'Contact Email', value: 'admin@ecity.com' }
  ];

  const mergedSettings = defaultSettings.map(def => {
    const existing = settings.find(s => s.key === def.key);
    return existing ? { ...def, value: existing.value } : def;
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">System Settings</h1>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow max-w-2xl">
        <div className="space-y-6">
          {mergedSettings.map((setting) => (
            <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-slate-700 pb-4 last:border-0 gap-4">
              <div>
                <label className="block font-medium text-gray-700 dark:text-slate-300">{setting.label}</label>
                <p className="text-sm text-gray-500 dark:text-slate-400">{setting.key}</p>
              </div>
              <div className="w-full sm:w-1/2">
                {setting.type === 'boolean' ? (
                  <select
                    className="block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                    value={setting.value}
                    onChange={(e) => handleUpdate(setting.key, e.target.value)}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                      defaultValue={setting.value}
                      onBlur={(e) => {
                        if (e.target.value !== setting.value) {
                          handleUpdate(setting.key, e.target.value);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
