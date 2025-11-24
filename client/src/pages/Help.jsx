import React from 'react';
import UserLayout from '../layouts/UserLayout';
import { HelpCircle, Phone, Mail, MessageSquare, FileText } from 'lucide-react';

const Help = () => {
  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Need assistance? We are here to help.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Phone className="mr-2 text-blue-600" /> Emergency Contacts
          </h2>
          <ul className="space-y-3">
            <li className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="font-medium dark:text-gray-200">Police Control Room</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">100</span>
            </li>
            <li className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="font-medium dark:text-gray-200">Fire Station</span>
              <span className="font-bold text-red-600 dark:text-red-400">101</span>
            </li>
            <li className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="font-medium dark:text-gray-200">Ambulance</span>
              <span className="font-bold text-green-600 dark:text-green-400">102</span>
            </li>
            <li className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="font-medium dark:text-gray-200">Women Helpline</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">1091</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Mail className="mr-2 text-blue-600" /> Contact Us
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            For non-emergency queries, you can reach out to the city administration via email or visit our main office.
          </p>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <Mail size={18} className="mr-3 text-gray-400" />
              <span>support@ecity.gov.in</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <Phone size={18} className="mr-3 text-gray-400" />
              <span>+91 11 2345 6789</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <MessageSquare size={18} className="mr-3 text-gray-400" />
              <span>Feedback Form</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
          <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
            <FileText className="mr-2" /> FAQs
          </h2>
          <div className="space-y-4 mt-4">
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-blue-900 dark:text-blue-200">
                <span>How do I report a new issue?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-blue-800 dark:text-blue-300 mt-3 group-open:animate-fadeIn">
                Navigate to the "Report Issue" page from the sidebar, fill in the details including location and category, and submit. You can also attach photos.
              </p>
            </details>
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-blue-900 dark:text-blue-200">
                <span>How can I track my complaint status?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-blue-800 dark:text-blue-300 mt-3 group-open:animate-fadeIn">
                Go to your Dashboard. The "My Reports" section shows all your submitted issues along with their current status (Pending, In Progress, Resolved).
              </p>
            </details>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Help;
