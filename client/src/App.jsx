import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axiosInstance from './utils/axios';
import Navbar from './components/Navbar'; // Keep for Home/Login pages if needed, or refactor
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const ReportIssue = lazy(() => import('./pages/ReportIssue'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminIssues = lazy(() => import('./pages/AdminIssues'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminEvents = lazy(() => import('./pages/AdminEvents'));
const AdminAnnouncements = lazy(() => import('./pages/AdminAnnouncements'));
const AdminLocations = lazy(() => import('./pages/AdminLocations'));
const AdminDepartments = lazy(() => import('./pages/AdminDepartments'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const IssueDetails = lazy(() => import('./pages/IssueDetails'));
const CityMap = lazy(() => import('./pages/CityMap'));
const UserEvents = lazy(() => import('./pages/UserEvents'));
const UserAnnouncements = lazy(() => import('./pages/UserAnnouncements'));
const Help = lazy(() => import('./pages/Help'));
const Documentation = lazy(() => import('./pages/Documentation'));
const ApiAccess = lazy(() => import('./pages/ApiAccess'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  // No need for manual token setup - axiosInstance handles it automatically

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<><Navbar /><Home /></>} />
              <Route path="/login" element={<><Navbar /><Login /></>} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/documentation" element={<><Navbar /><Documentation /></>} />
              <Route path="/api-access" element={<><Navbar /><ApiAccess /></>} />
              <Route path="/privacy-policy" element={<><Navbar /><PrivacyPolicy /></>} />
              <Route path="/terms-of-service" element={<><Navbar /><TermsOfService /></>} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />

              {/* User Routes */}
              <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/events" element={<UserEvents />} />
                <Route path="/announcements" element={<UserAnnouncements />} />
                <Route path="/report" element={<ReportIssue />} />
                <Route path="/issues/:id" element={<IssueDetails />} />
                <Route path="/map" element={<CityMap />} />
                <Route path="/help" element={<Help />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/issues" element={<AdminIssues />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/departments" element={<AdminDepartments />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                <Route path="/admin/locations" element={<AdminLocations />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              {/* 404 Not Found */}
              <Route path="/404" element={<NotFound />} />

              {/* Catch-all route - redirect to 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
