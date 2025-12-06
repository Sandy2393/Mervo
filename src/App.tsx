import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import AuthLandingPage from './pages/AuthLandingPage';
import CorporateLoginPage from './pages/CorporateLoginPage';
import ContractorLoginPage from './pages/ContractorLoginPage';
import CompanySelectorPage from './pages/CompanySelectorPage';
import AccountLinkingSettingsPage from './pages/settings/AccountLinkingSettingsPage';
import CorporateDashboard from './pages/corporate/CorporateDashboard';
import CompanySettings from './pages/corporate/CompanySettings';
import SuperAdminPanel from './pages/super-admin/SuperAdminPanel';
import SuperAdminLogin from './pages/super-admin/SuperAdminLogin';
import CreateJobPage from './pages/corporate/CreateJobPage';
import ContractorListPage from './pages/corporate/ContractorListPage';
import ContractorTodayDashboard from './pages/contractor/ContractorTodayDashboard';
import JobExecutionPage from './pages/contractor/JobExecutionPage';
import MyEarnings from './pages/contractor/MyEarnings';
import TimesheetsPage from './pages/contractor/TimesheetsPage';

// Layout
import MainLayout from './layouts/MainLayout';

// Protected Route Wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles: _requiredRoles
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { user } = useAuth();

  // Redirect authenticated users from login page
  if (user && window.location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<AuthLandingPage />} />
      <Route path="/login/corporate" element={<CorporateLoginPage />} />
      <Route path="/contractor/login" element={<ContractorLoginPage />} />
      <Route path="/select-company" element={<CompanySelectorPage />} />
      <Route path="/settings/account-linking" element={<AccountLinkingSettingsPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              {user?.role === 'contractor' ? (
                <ContractorTodayDashboard />
              ) : (
                <CorporateDashboard />
              )}
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Contractor Routes */}
      <Route
        path="/contractor/job/:jobInstanceId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <JobExecutionPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/contractor/earnings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyEarnings />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/contractor/timesheets"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TimesheetsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/contractor/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ContractorTodayDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Corporate Routes */}
      <Route
        path="/corporate/jobs/create"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateJobPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/corporate/jobs"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CorporateDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/corporate/contractors"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ContractorListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Company settings */}
      <Route
        path="/corporate/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CompanySettings />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Super Admin Login - With secret key validation */}
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />

      {/* Super Admin Panel */}
      <Route
        path="/super-admin"
        element={
          <MainLayout>
            <SuperAdminPanel />
          </MainLayout>
        }
      />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
