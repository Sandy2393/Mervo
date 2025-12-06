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
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import CompaniesList from './pages/super-admin/CompaniesList';
import CompanyDetail from './pages/super-admin/CompanyDetail';
import BillingOverview from './pages/super-admin/BillingOverview';
import BillingCompanyDetail from './pages/super-admin/BillingCompanyDetail';
import CouponManager from './pages/super-admin/CouponManager';
import AuditViewer from './pages/super-admin/AuditViewer';
import StorageManager from './pages/super-admin/StorageManager';
import OfflineCenter from './pages/super-admin/OfflineCenter';
import PreLaunchReadiness from './pages/super-admin/PreLaunchReadiness';
import CreateJobPage from './pages/corporate/CreateJobPage';
import ContractorListPage from './pages/corporate/ContractorListPage';
import ContractorTodayDashboard from './pages/contractor/ContractorTodayDashboard';
import JobExecutionPage from './pages/contractor/JobExecutionPage';
import MyEarnings from './pages/contractor/MyEarnings';
import TimesheetsPage from './pages/contractor/TimesheetsPage';

// Layout
import MainLayout from './layouts/MainLayout';
import { RequireSuperAdmin } from './guards/RequireSuperAdmin';

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

const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RequireSuperAdmin>
    <MainLayout>{children}</MainLayout>
  </RequireSuperAdmin>
);

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

      {/* Super Admin Area */}
      <Route path="/super-admin" element={<SuperAdminRoute><SuperAdminPanel /></SuperAdminRoute>} />
      <Route path="/super-admin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
      <Route path="/super-admin/companies" element={<SuperAdminRoute><CompaniesList /></SuperAdminRoute>} />
      <Route path="/super-admin/company/:companyId" element={<SuperAdminRoute><CompanyDetail /></SuperAdminRoute>} />
      <Route path="/super-admin/billing" element={<SuperAdminRoute><BillingOverview /></SuperAdminRoute>} />
      <Route path="/super-admin/billing/company/:companyId" element={<SuperAdminRoute><BillingCompanyDetail /></SuperAdminRoute>} />
      <Route path="/super-admin/billing/coupons" element={<SuperAdminRoute><CouponManager /></SuperAdminRoute>} />
      <Route path="/super-admin/audit" element={<SuperAdminRoute><AuditViewer /></SuperAdminRoute>} />
      <Route path="/super-admin/storage" element={<SuperAdminRoute><StorageManager /></SuperAdminRoute>} />
      <Route path="/super-admin/offline" element={<SuperAdminRoute><OfflineCenter /></SuperAdminRoute>} />
      <Route path="/super-admin/prelaunch" element={<SuperAdminRoute><PreLaunchReadiness /></SuperAdminRoute>} />

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
