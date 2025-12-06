import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

/**
 * generate_demo_data.ts
 * Inserts demo data into a Supabase project for local/dev usage.
 *
 * Usage:
 *   npm ts-node demo/generate_demo_data.ts --dry-run
 *   npm ts-node demo/generate_demo_data.ts
 *
 * TODO: Replace SUPABASE_URL and SUPABASE_ANON_KEY placeholders in your .env before running.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'REPLACE_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'REPLACE_SUPABASE_ANON_KEY';

const DRY_RUN = process.argv.includes('--dry-run');

if (SUPABASE_URL.includes('REPLACE') || SUPABASE_ANON_KEY.includes('REPLACE')) {
  console.error('✖ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function upsert(table: string, rows: Record<string, unknown>[]) {
  if (DRY_RUN) {
    console.log(`[dry-run] would upsert into ${table}:`, rows);
    return;
  }
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw error;
  console.log(`✔ Upserted ${rows.length} rows into ${table}`);
}

async function main() {
  // Companies
  await upsert('companies', [
    { id: '00000000-0000-0000-0000-000000000001', name: 'DemoCo Pty Ltd', domain: 'democo.local', created_at: new Date().toISOString() },
    { id: '00000000-0000-0000-0000-000000000002', name: 'FieldOps Test Ltd', domain: 'fieldops.local', created_at: new Date().toISOString() },
  ]);

  // Users (profiles) — ensure Auth users are created separately
  await upsert('users', [
    { id: '11111111-1111-1111-1111-111111111111', email: 'owner@democo.local', full_name: 'Demo Owner', phone: '+61000000001', created_at: new Date().toISOString() },
    { id: '22222222-2222-2222-2222-222222222222', email: 'manager@democo.local', full_name: 'Demo Manager', phone: '+61000000002', created_at: new Date().toISOString() },
    { id: '33333333-3333-3333-3333-333333333333', email: 'contractor@democo.local', full_name: 'Demo Contractor', phone: '+61000000003', created_at: new Date().toISOString() },
    { id: '44444444-4444-4444-4444-444444444444', email: 'owner@fieldops.local', full_name: 'FieldOps Owner', phone: '+61000000004', created_at: new Date().toISOString() },
  ]);

  // Company Users
  await upsert('company_users', [
    { company_id: '00000000-0000-0000-0000-000000000001', user_id: '11111111-1111-1111-1111-111111111111', role_level: 100, permissions: { jobs: 'edit', billing: 'edit' }, company_alias: 'democo-owner' },
    { company_id: '00000000-0000-0000-0000-000000000001', user_id: '22222222-2222-2222-2222-222222222222', role_level: 80, permissions: { jobs: 'edit' }, company_alias: 'democo-manager' },
    { company_id: '00000000-0000-0000-0000-000000000001', user_id: '33333333-3333-3333-3333-333333333333', role_level: 20, permissions: { jobs: 'view' }, company_alias: 'democo-contractor' },
    { company_id: '00000000-0000-0000-0000-000000000002', user_id: '44444444-4444-4444-4444-444444444444', role_level: 100, permissions: { jobs: 'edit', billing: 'edit' }, company_alias: 'fieldops-owner' },
  ]);

  // Jobs
  await upsert('jobs', [
    { id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', company_id: '00000000-0000-0000-0000-000000000001', job_name: 'Site Inspection - Warehouse', description: 'Inspect safety equipment and exits', priority: 'high', status: 'open', publish: true, created_by: '11111111-1111-1111-1111-111111111111', created_at: new Date().toISOString() },
    { id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', company_id: '00000000-0000-0000-0000-000000000001', job_name: 'Cleaning - Office L3', description: 'Deep clean of level 3 offices', priority: 'medium', status: 'open', publish: true, created_by: '22222222-2222-2222-2222-222222222222', created_at: new Date().toISOString() },
    { id: 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', company_id: '00000000-0000-0000-0000-000000000002', job_name: 'HVAC Maintenance', description: 'Quarterly HVAC check', priority: 'medium', status: 'open', publish: true, created_by: '44444444-4444-4444-4444-444444444444', created_at: new Date().toISOString() },
  ]);

  // Job Instances
  await upsert('job_instances', [
    { id: 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', company_id: '00000000-0000-0000-0000-000000000001', job_id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', assigned_to: '33333333-3333-3333-3333-333333333333', status: 'assigned', scheduled_for: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString() },
    { id: 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', company_id: '00000000-0000-0000-0000-000000000001', job_id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', assigned_to: '33333333-3333-3333-3333-333333333333', status: 'scheduled', scheduled_for: new Date(Date.now() + 2*86400000).toISOString(), created_at: new Date().toISOString() },
    { id: 'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', company_id: '00000000-0000-0000-0000-000000000002', job_id: 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', assigned_to: '44444444-4444-4444-4444-444444444444', status: 'scheduled', scheduled_for: new Date(Date.now() + 3*86400000).toISOString(), created_at: new Date().toISOString() },
  ]);

  // Timesheets
  await upsert('timesheets', [
    { id: 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', user_id: '33333333-3333-3333-3333-333333333333', company_id: '00000000-0000-0000-0000-000000000001', job_instance_id: 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', clock_in: new Date(Date.now() - 2*3600000).toISOString(), clock_out: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString() },
  ]);

  // Contractor Ratings (if table exists)
  await upsert('contractor_ratings', [
    { id: 'ddddddd1-dddd-dddd-dddd-ddddddddddd1', company_id: '00000000-0000-0000-0000-000000000001', contractor_id: '33333333-3333-3333-3333-333333333333', rating: 5, comment: 'Excellent work, on time and thorough', created_at: new Date().toISOString() },
  ]);

  console.log('Demo data inserted successfully');
}

main().catch((err) => {
  console.error('✖ Error inserting demo data', err);
  process.exit(1);
});
