/**
 * Super Admin Panel — Stub for super admin features
 * TODO: Implement with proper RLS and audit logging
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useEffect, useState } from 'react';
import { superAdminFetch } from '../../lib/session/companyContext';
import { Building2, DollarSign, FileSearch, HardDrive, CloudOff, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

type Summary = {
  totalCompanies: number;
  activeCompanies: number;
  overdueInvoices: number;
  mrr: number;
};

export default function SuperAdminPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [billingRes, companiesRes] = await Promise.all([
          superAdminFetch('/api/super-admin/billing/dashboard'),
          superAdminFetch('/api/super-admin/companies?limit=5'),
        ]);
        const billing = billingRes.ok ? await billingRes.json() : null;
        const companies = companiesRes.ok ? await companiesRes.json() : { items: [] };
        setSummary({
          totalCompanies: companies.items?.length || 0,
          activeCompanies: (companies.items || []).filter((c: any) => c.status === 'active').length,
          overdueInvoices: billing?.summary?.overdueInvoices || 0,
          mrr: billing?.summary?.totalMRR || 0,
        });
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Super Admin Panel
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">System administration and company management</p>
        </div>
        <div className="text-right">
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <div className="space-y-1">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {summary?.totalCompanies || 0} Companies
              </Badge>
              <p className="text-xs text-muted-foreground">System-wide</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Companies</p>
                  <h3 className="text-3xl font-bold mt-1">{summary?.activeCompanies ?? 0}</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Operational
                  </p>
                </div>
                <Building2 className="h-10 w-10 text-green-500 opacity-20" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <h3 className="text-3xl font-bold mt-1">${summary?.mrr ?? 0}</h3>
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    MRR
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-blue-500 opacity-20" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue Invoices</p>
                  <h3 className="text-3xl font-bold mt-1">{summary?.overdueInvoices ?? 0}</h3>
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Requires attention
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-orange-500 opacity-20" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                <h3 className="text-3xl font-bold mt-1">{summary?.totalCompanies ?? 0}</h3>
                <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  All status
                </p>
              </div>
              <Building2 className="h-10 w-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle>Companies Management</CardTitle>
                <CardDescription>
                  Active: <Badge variant="outline" className="ml-1">{summary?.activeCompanies ?? '—'}</Badge>
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/super-admin/companies">
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              List, suspend, activate, and manage all companies in the system
            </p>
            <Button asChild className="w-full">
              <a href="/super-admin/companies">Manage Companies</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <CardTitle>Billing & Revenue</CardTitle>
                <CardDescription>
                  MRR: <Badge variant="outline" className="ml-1">${summary?.mrr ?? '—'}</Badge>
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/super-admin/billing">
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor invoices, MRR, manage coupons and billing settings
            </p>
            <Button asChild className="w-full" variant="outline">
              <a href="/super-admin/billing">View Billing</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileSearch className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Search and export system events</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/super-admin/audit">
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View comprehensive system audit trail and security events
            </p>
            <Button asChild className="w-full" variant="outline">
              <a href="/super-admin/audit">Open Audit Logs</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <HardDrive className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <CardTitle>Storage & Sync</CardTitle>
                <CardDescription>Health monitoring and retries</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage storage health and offline sync retry queues
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1" variant="outline" size="sm">
                <a href="/super-admin/storage">
                  <HardDrive className="h-4 w-4 mr-1" />
                  Storage
                </a>
              </Button>
              <Button asChild className="flex-1" variant="outline" size="sm">
                <a href="/super-admin/offline">
                  <CloudOff className="h-4 w-4 mr-1" />
                  Offline
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
