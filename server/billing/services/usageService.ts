/**
 * Usage Service
 * Tracks and calculates real-time resource usage for companies
 */

import { supabase } from '../../db/supabaseClient';
import type { UsageMetrics } from './tierService';

export interface UsageSnapshot {
  id: string;
  companyId: string;
  snapshotDate: string;
  storageGb: number;
  apiCallsCount: number;
  contractorsActive: number;
  concurrentConnections: number;
  dataExportedGb: number;
  createdAt: string;
}

export interface UsageTrend {
  date: string;
  storageGb: number;
  apiCalls: number;
  contractors: number;
}

class UsageService {
  /**
   * Get current real-time usage for a company
   */
  async getCurrentUsage(companyId: string): Promise<UsageMetrics> {
    // Get latest snapshot
    const latestSnapshot = await this.getLatestSnapshot(companyId);
    
    if (latestSnapshot) {
      return {
        contractors: latestSnapshot.contractorsActive,
        storageGB: latestSnapshot.storageGb,
        apiCalls: latestSnapshot.apiCallsCount,
        concurrentConnections: latestSnapshot.concurrentConnections,
      };
    }

    // If no snapshot exists, calculate from live data
    return await this.calculateLiveUsage(companyId);
  }

  /**
   * Calculate live usage from database
   */
  private async calculateLiveUsage(companyId: string): Promise<UsageMetrics> {
    // Calculate storage from jobs, evidence, exports
    const storageGB = await this.calculateStorageUsage(companyId);
    
    // Count API calls from today
    const apiCalls = await this.countTodayApiCalls(companyId);
    
    // Count active contractors
    const contractors = await this.countActiveContractors(companyId);
    
    // Get concurrent connections (would need real-time tracking)
    const concurrentConnections = 0; // Placeholder - implement via WebSocket tracking

    return {
      contractors,
      storageGB,
      apiCalls,
      concurrentConnections,
    };
  }

  /**
   * Calculate total storage usage in GB
   */
  private async calculateStorageUsage(companyId: string): Promise<number> {
    // Sum up storage from various sources
    
    // Job photos/evidence (placeholder - would query actual file sizes)
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, evidence_files')
      .eq('company_id', companyId);
    
    // Estimate: assume average 5MB per job with evidence
    const jobStorageMB = (jobs?.length || 0) * 5;
    
    // Export files
    const { data: exports } = await supabase
      .from('data_exports')
      .select('file_size_bytes')
      .eq('company_id', companyId);
    
    const exportStorageBytes = exports?.reduce((sum, e) => sum + (e.file_size_bytes || 0), 0) || 0;
    const exportStorageMB = exportStorageBytes / (1024 * 1024);
    
    // Convert to GB
    const totalGB = (jobStorageMB + exportStorageMB) / 1024;
    
    return parseFloat(totalGB.toFixed(3));
  }

  /**
   * Count API calls for today
   */
  private async countTodayApiCalls(companyId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: snapshot } = await supabase
      .from('company_usage_snapshots')
      .select('api_calls_count')
      .eq('company_id', companyId)
      .eq('snapshot_date', today)
      .single();
    
    return snapshot?.api_calls_count || 0;
  }

  /**
   * Count active contractors
   */
  private async countActiveContractors(companyId: string): Promise<number> {
    const { count } = await supabase
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active');
    
    return count || 0;
  }

  /**
   * Capture daily usage snapshot
   */
  async captureSnapshot(companyId: string): Promise<UsageSnapshot> {
    const usage = await this.calculateLiveUsage(companyId);
    const today = new Date().toISOString().split('T')[0];
    
    // Check if snapshot already exists for today
    const { data: existing } = await supabase
      .from('company_usage_snapshots')
      .select('*')
      .eq('company_id', companyId)
      .eq('snapshot_date', today)
      .single();
    
    if (existing) {
      // Update existing snapshot
      const { data, error } = await supabase
        .from('company_usage_snapshots')
        .update({
          storage_gb: usage.storageGB,
          api_calls_count: usage.apiCalls,
          contractors_active: usage.contractors,
          concurrent_connections: usage.concurrentConnections,
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return this.mapSnapshot(data);
    } else {
      // Create new snapshot
      const { data, error } = await supabase
        .from('company_usage_snapshots')
        .insert({
          company_id: companyId,
          snapshot_date: today,
          storage_gb: usage.storageGB,
          api_calls_count: usage.apiCalls,
          contractors_active: usage.contractors,
          concurrent_connections: usage.concurrentConnections,
          data_exported_gb: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return this.mapSnapshot(data);
    }
  }

  /**
   * Get latest snapshot for a company
   */
  async getLatestSnapshot(companyId: string): Promise<UsageSnapshot | null> {
    const { data, error } = await supabase
      .from('company_usage_snapshots')
      .select('*')
      .eq('company_id', companyId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return null;
    return this.mapSnapshot(data);
  }

  /**
   * Get usage snapshot for specific date
   */
  async getSnapshotForDate(companyId: string, date: string): Promise<UsageSnapshot | null> {
    const { data, error } = await supabase
      .from('company_usage_snapshots')
      .select('*')
      .eq('company_id', companyId)
      .eq('snapshot_date', date)
      .single();
    
    if (error || !data) return null;
    return this.mapSnapshot(data);
  }

  /**
   * Get usage trend over time
   */
  async getUsageTrend(companyId: string, days: number = 30): Promise<UsageTrend[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('company_usage_snapshots')
      .select('snapshot_date, storage_gb, api_calls_count, contractors_active')
      .eq('company_id', companyId)
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .lte('snapshot_date', endDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });
    
    if (error || !data) return [];
    
    return data.map(d => ({
      date: d.snapshot_date,
      storageGb: d.storage_gb,
      apiCalls: d.api_calls_count,
      contractors: d.contractors_active,
    }));
  }

  /**
   * Get usage for current billing period (month-to-date)
   */
  async getCurrentPeriodUsage(companyId: string): Promise<UsageMetrics> {
    // For monthly billing, get average/max usage for current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('company_usage_snapshots')
      .select('*')
      .eq('company_id', companyId)
      .gte('snapshot_date', monthStart)
      .order('snapshot_date', { ascending: false });
    
    if (error || !data || data.length === 0) {
      return await this.getCurrentUsage(companyId);
    }
    
    // Use max values for the month (peak usage)
    const maxStorage = Math.max(...data.map(d => d.storage_gb));
    const totalApiCalls = data.reduce((sum, d) => sum + d.api_calls_count, 0);
    const maxContractors = Math.max(...data.map(d => d.contractors_active));
    const maxConnections = Math.max(...data.map(d => d.concurrent_connections));
    
    return {
      contractors: maxContractors,
      storageGB: parseFloat(maxStorage.toFixed(3)),
      apiCalls: totalApiCalls,
      concurrentConnections: maxConnections,
    };
  }

  /**
   * Increment API call counter
   */
  async incrementApiCalls(companyId: string, count: number = 1): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get or create today's snapshot
    const { data: existing } = await supabase
      .from('company_usage_snapshots')
      .select('*')
      .eq('company_id', companyId)
      .eq('snapshot_date', today)
      .single();
    
    if (existing) {
      await supabase
        .from('company_usage_snapshots')
        .update({
          api_calls_count: existing.api_calls_count + count,
        })
        .eq('id', existing.id);
    } else {
      // Create new snapshot with API call count
      await supabase
        .from('company_usage_snapshots')
        .insert({
          company_id: companyId,
          snapshot_date: today,
          api_calls_count: count,
          storage_gb: 0,
          contractors_active: 0,
          concurrent_connections: 0,
          data_exported_gb: 0,
        });
    }
  }

  /**
   * Get storage breakdown by category
   */
  async getStorageBreakdown(companyId: string): Promise<{
    jobPhotos: number;
    jobReports: number;
    timesheets: number;
    exports: number;
    total: number;
  }> {
    // Placeholder - would implement actual file size queries
    const totalStorage = await this.calculateStorageUsage(companyId);
    
    // Rough estimates (would calculate actual sizes)
    return {
      jobPhotos: parseFloat((totalStorage * 0.7).toFixed(3)),
      jobReports: parseFloat((totalStorage * 0.15).toFixed(3)),
      timesheets: parseFloat((totalStorage * 0.1).toFixed(3)),
      exports: parseFloat((totalStorage * 0.05).toFixed(3)),
      total: totalStorage,
    };
  }

  /**
   * Map database row to UsageSnapshot
   */
  private mapSnapshot(data: any): UsageSnapshot {
    return {
      id: data.id,
      companyId: data.company_id,
      snapshotDate: data.snapshot_date,
      storageGb: data.storage_gb,
      apiCallsCount: data.api_calls_count,
      contractorsActive: data.contractors_active,
      concurrentConnections: data.concurrent_connections,
      dataExportedGb: data.data_exported_gb,
      createdAt: data.created_at,
    };
  }

  /**
   * Capture snapshots for all active companies (daily cron job)
   */
  async captureAllSnapshots(): Promise<{ success: number; failed: number }> {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id')
      .eq('status', 'active');
    
    if (error || !companies) {
      throw new Error('Failed to fetch companies for snapshot');
    }
    
    let success = 0;
    let failed = 0;
    
    for (const company of companies) {
      try {
        await this.captureSnapshot(company.id);
        success++;
      } catch (err) {
        console.error(`Failed to capture snapshot for company ${company.id}:`, err);
        failed++;
      }
    }
    
    return { success, failed };
  }
}

export const usageService = new UsageService();
