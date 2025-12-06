import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
const ProtectedRoute = ({ children, requiredRoles: _requiredRoles }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("p", { className: "text-gray-600", children: "Loading..." }) }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
const SuperAdminRoute = ({ children }) => (_jsx(RequireSuperAdmin, { children: _jsx(MainLayout, { children: children }) }));
function AppContent() {
    const { user } = useAuth();
    // Redirect authenticated users from login page
    if (user && window.location.pathname === '/login') {
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(AuthLandingPage, {}) }), _jsx(Route, { path: "/login/corporate", element: _jsx(CorporateLoginPage, {}) }), _jsx(Route, { path: "/contractor/login", element: _jsx(ContractorLoginPage, {}) }), _jsx(Route, { path: "/select-company", element: _jsx(CompanySelectorPage, {}) }), _jsx(Route, { path: "/settings/account-linking", element: _jsx(AccountLinkingSettingsPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: user?.role === 'contractor' ? (_jsx(ContractorTodayDashboard, {})) : (_jsx(CorporateDashboard, {})) }) }) }), _jsx(Route, { path: "/contractor/job/:jobInstanceId", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(JobExecutionPage, {}) }) }) }), _jsx(Route, { path: "/contractor/earnings", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(MyEarnings, {}) }) }) }), _jsx(Route, { path: "/contractor/timesheets", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(TimesheetsPage, {}) }) }) }), _jsx(Route, { path: "/contractor/*", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(ContractorTodayDashboard, {}) }) }) }), _jsx(Route, { path: "/corporate/jobs/create", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(CreateJobPage, {}) }) }) }), _jsx(Route, { path: "/corporate/jobs", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(CorporateDashboard, {}) }) }) }), _jsx(Route, { path: "/corporate/contractors", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(ContractorListPage, {}) }) }) }), _jsx(Route, { path: "/corporate/settings", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(CompanySettings, {}) }) }) }), _jsx(Route, { path: "/super-admin/login", element: _jsx(SuperAdminLogin, {}) }), _jsx(Route, { path: "/super-admin", element: _jsx(SuperAdminRoute, { children: _jsx(SuperAdminPanel, {}) }) }), _jsx(Route, { path: "/super-admin/dashboard", element: _jsx(SuperAdminRoute, { children: _jsx(SuperAdminDashboard, {}) }) }), _jsx(Route, { path: "/super-admin/companies", element: _jsx(SuperAdminRoute, { children: _jsx(CompaniesList, {}) }) }), _jsx(Route, { path: "/super-admin/company/:companyId", element: _jsx(SuperAdminRoute, { children: _jsx(CompanyDetail, {}) }) }), _jsx(Route, { path: "/super-admin/billing", element: _jsx(SuperAdminRoute, { children: _jsx(BillingOverview, {}) }) }), _jsx(Route, { path: "/super-admin/billing/company/:companyId", element: _jsx(SuperAdminRoute, { children: _jsx(BillingCompanyDetail, {}) }) }), _jsx(Route, { path: "/super-admin/billing/coupons", element: _jsx(SuperAdminRoute, { children: _jsx(CouponManager, {}) }) }), _jsx(Route, { path: "/super-admin/audit", element: _jsx(SuperAdminRoute, { children: _jsx(AuditViewer, {}) }) }), _jsx(Route, { path: "/super-admin/storage", element: _jsx(SuperAdminRoute, { children: _jsx(StorageManager, {}) }) }), _jsx(Route, { path: "/super-admin/offline", element: _jsx(SuperAdminRoute, { children: _jsx(OfflineCenter, {}) }) }), _jsx(Route, { path: "/super-admin/prelaunch", element: _jsx(SuperAdminRoute, { children: _jsx(PreLaunchReadiness, {}) }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }));
}
export default function App() {
    return (_jsx(Router, { children: _jsx(AuthProvider, { children: _jsx(AppContent, {}) }) }));
}
