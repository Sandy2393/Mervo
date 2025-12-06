/**
 * Main Layout — Navigation header and sidebar
 * Wraps all authenticated pages
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, companyUser, logout, companies, activeCompanyId, switchCompany } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isDashboardRoute = window.location.pathname === '/dashboard';
  const isContractorRoute = window.location.pathname.startsWith('/contractor');
  const isCorporateRoute = window.location.pathname.startsWith('/corporate');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <h1 className="text-xl font-bold text-gray-900">Mervo Ops</h1>
            </Link>

            {/* Primary Nav */}
            <nav className="hidden md:flex gap-6">
              {(isCorporateRoute || companyUser?.role !== 'contractor') && (
                <>
                  <Link
                    to="/dashboard"
                    className={`${
                      isDashboardRoute ? 'text-orange-500 font-semibold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/corporate/jobs"
                    className={`${
                      isCorporateRoute ? 'text-orange-500 font-semibold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Jobs
                  </Link>
                  <Link
                    to="/corporate/contractors"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Contractors
                  </Link>
                  <Link
                    to="/corporate/settings"
                    className={`text-gray-600 hover:text-gray-900`}
                  >
                    Settings
                  </Link>
                </>
              )}

              {isContractorRoute && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Today
                  </Link>
                  <Link
                    to="/contractor/earnings"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Earnings
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Company Selector */}
            {companies.length > 1 && (
              <select
                value={activeCompanyId || ''}
                onChange={(e) => switchCompany(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            )}

            {/* User Info */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.display_name || companyUser?.company_alias || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'contractor'}
              </p>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2025 Mervo Ops. Field Operations Management.</p>
        </div>
      </footer>
    </div>
  );
}
