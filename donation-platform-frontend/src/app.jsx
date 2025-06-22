import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import './lib/i18n'; // Initialize i18n
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CampaignsPage from './pages/CampaignsPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CampaignDetailsPage from './pages/CampaignDetailsPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCampaignsPage from './pages/admin/AdminCampaignsPage';
import AdminDonationsPage from './pages/admin/AdminDonationsPage';
import { Toaster } from './components/ui/sonner';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin route component - requires authentication and admin role
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Enhanced debug logging
  console.log("Admin route check:", { 
    isAuthenticated, 
    user,
    is_admin: user?.is_admin,
    isAdmin: user?.isAdmin,
    admin: user?.admin
  });
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check for admin status with more flexibility to handle different API responses
  const isAdmin = 
    user?.is_admin === true || // Check snake_case (is_admin)
    user?.isAdmin === true ||  // Check camelCase (isAdmin)
    user?.admin === true ||    // Check simple property (admin)
    user?.role === 'admin';    // Check role property
  
  if (!isAdmin) {
    console.log("User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  console.log("Admin access granted");
  return children;
};

function App() {
  return (
    <AuthProvider>
       <Toaster />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <>
              <Navbar />
              <HomePage />
              <Footer />
            </>
          } />
          <Route path="/login" element={
            <>
              <Navbar />
              <LoginPage />
              <Footer />
            </>
          } />
          <Route path="/register" element={
            <>
              <Navbar />
              <RegisterPage />
              <Footer />
            </>
          } />
          <Route path="/campaigns/:id" element={
            <>
              <Navbar />
              <CampaignDetailsPage />
              <Footer />
            </>
          } />
          <Route path="/campaigns" element={
            <>
              <Navbar />
              <CampaignsPage />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <Navbar />
              <AboutPage />
              <Footer />
            </>
          } />
          <Route path="/how-it-works" element={
            <>
              <Navbar />
              <HowItWorksPage />
              <Footer />
            </>
          } />
          
          {/* Protected routes */}
          <Route path="/create-campaign" element={
            <ProtectedRoute>
              <Navbar />
              <CreateCampaignPage />
              <Footer />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/campaigns" element={
            <AdminRoute>
              <AdminLayout>
                <AdminCampaignsPage />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/donations" element={
            <AdminRoute>
              <AdminLayout>
                <AdminDonationsPage />
              </AdminLayout>
            </AdminRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
