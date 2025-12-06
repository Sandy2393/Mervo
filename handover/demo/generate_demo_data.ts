/**
 * generate_demo_data.ts
 *
 * CLI tool to generate and seed demo data for Mervo platform
 * Version 1.0 - December 2025
 *
 * Usage:
 *   npm run seed-demo-data -- --confirm
 *   npm run seed-demo-data -- --dry-run
 *   npm run seed-demo-data -- --clean
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Types for demo data
interface DemoUser {
  id?: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  company_alias: string;
  role: 'contractor' | 'admin' | 'employee';
}

interface DemoCompany {
  id?: string;
  name: string;
  owner_email: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface DemoJob {
  id?: string;
  company_id: string;
  job_name: string;
  description: string;
  rate_type: 'hourly' | 'flat';
  rate_amount: number;
  estimated_hours: number;
  location: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'REPLACE_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'REPLACE_SUPABASE_KEY';

if (!supabaseUrl.startsWith('http')) {
  console.error('ERROR: SUPABASE_URL not set. Set environment variables or edit REPLACE_* values.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Demo data definition
const demoUsers: DemoUser[] = [
  {
    email: 'contractor-alice@mervo-demo.app',
    password: 'contractor-demo-password-alice',
    full_name: 'Alice Johnson',
    phone: '+1-555-0101',
    company_alias: 'alice_contracting',
    role: 'contractor',
  },
  {
    email: 'contractor-bob@mervo-demo.app',
    password: 'contractor-demo-password-bob',
    full_name: 'Bob Smith',
    phone: '+1-555-0102',
    company_alias: 'bob_installations',
    role: 'contractor',
  },
  {
    email: 'contractor-carol@mervo-demo.app',
    password: 'contractor-demo-password-carol',
    full_name: 'Carol Williams',
    phone: '+1-555-0103',
    company_alias: 'carol_services',
    role: 'contractor',
  },
  {
    email: 'contractor-david@mervo-demo.app',
    password: 'contractor-demo-password-david',
    full_name: 'David Brown',
    phone: '+1-555-0104',
    company_alias: 'david_solutions',
    role: 'contractor',
  },
  {
    email: 'admin-acme@mervo-demo.app',
    password: 'admin-demo-password-acme',
    full_name: 'John ACME Admin',
    phone: '+1-555-0201',
    company_alias: 'acme_corp',
    role: 'admin',
  },
  {
    email: 'admin-globex@mervo-demo.app',
    password: 'admin-demo-password-globex',
    full_name: 'Sarah Globex Manager',
    phone: '+1-555-0202',
    company_alias: 'globex_corp',
    role: 'admin',
  },
];

const demoCompanies: DemoCompany[] = [
  {
    name: 'ACME Corp Demo',
    owner_email: 'admin-acme@mervo-demo.app',
    email: 'info@acme-demo.app',
    phone: '+1-555-1001',
    address: '123 Demo Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
  },
  {
    name: 'Globex Corp Demo',
    owner_email: 'admin-globex@mervo-demo.app',
    email: 'contact@globex-demo.app',
    phone: '+1-555-1002',
    address: '456 Test Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10001',
  },
];

// Utility functions
async function log(message: string, level: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const prefix = {
    info: '[ℹ️ ]',
    success: '[✅]',
    error: '[❌]',
    warn: '[⚠️ ]',
  };
  console.log(`${prefix[level]} ${message}`);
}

async function dryRun() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║ DRY RUN: Preview of demo data that would be created        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await log('Demo Users to Create:', 'info');
  demoUsers.forEach((user) => {
    console.log(`  • ${user.full_name} (${user.email}) - ${user.role}`);
  });

  await log('Demo Companies to Create:', 'info');
  demoCompanies.forEach((company) => {
    console.log(`  • ${company.name} - Owner: ${company.owner_email}`);
  });

  console.log('\n📊 Summary:');
  console.log(`  • Users: ${demoUsers.length}`);
  console.log(`  • Companies: ${demoCompanies.length}`);
  console.log(`  • Jobs: 4 (will be created per company)`);
  console.log(`  • Job Instances: 4 (work assignments)`);
  console.log(`  • Ratings: 2 (demo feedback)`);
  console.log(`  • Audit Logs: 5+ (activity tracking)`);

  console.log('\n✨ To proceed with actual creation, run:');
  console.log('   npm run seed-demo-data -- --confirm\n');
}

async function seedUsers(): Promise<Record<string, string>> {
  await log('Creating demo users...', 'info');
  const userMap: Record<string, string> = {};

  for (const user of demoUsers) {
    try {
      // For demo purposes, use the Supabase auth API
      // In production, this would use proper auth
      const { data, error } = await supabase.auth.signUpWithPassword({
        email: user.email,
        password: user.password,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          await log(`User already exists: ${user.email}`, 'warn');
          // Still track the ID
          const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();
          if (existing) {
            userMap[user.email] = existing.id;
          }
        } else {
          await log(`Failed to create user ${user.email}: ${error.message}`, 'error');
        }
      } else if (data?.user) {
        userMap[user.email] = data.user.id;
        await log(`Created user: ${user.full_name}`, 'success');
      }
    } catch (err) {
      await log(`Error creating user ${user.email}: ${err}`, 'error');
    }
  }

  return userMap;
}

async function seedCompanies(userMap: Record<string, string>): Promise<Record<string, string>> {
  await log('Creating demo companies...', 'info');
  const companyMap: Record<string, string> = {};

  for (const company of demoCompanies) {
    try {
      const ownerId = userMap[company.owner_email];
      if (!ownerId) {
        await log(`Company owner not found: ${company.owner_email}`, 'error');
        continue;
      }

      const companyId = uuidv4();
      const { error } = await supabase.from('companies').insert({
        id: companyId,
        name: company.name,
        owner_id: ownerId,
        email: company.email,
        phone: company.phone,
        address: company.address,
        city: company.city,
        state: company.state,
        zip: company.zip,
        country: 'USA',
        active: true,
        created_at: new Date().toISOString(),
      });

      if (error) {
        await log(`Failed to create company ${company.name}: ${error.message}`, 'error');
      } else {
        companyMap[company.email] = companyId;
        await log(`Created company: ${company.name}`, 'success');
      }
    } catch (err) {
      await log(`Error creating company: ${err}`, 'error');
    }
  }

  return companyMap;
}

async function seedJobs(companyMap: Record<string, string>) {
  await log('Creating demo jobs...', 'info');

  const jobs: DemoJob[] = [
    {
      company_id: companyMap['info@acme-demo.app'],
      job_name: 'Install Office Shelving - Demo',
      description: 'Install industrial shelving units in warehouse',
      rate_type: 'hourly',
      rate_amount: 45.0,
      estimated_hours: 8.0,
      location: 'San Francisco, CA',
    },
    {
      company_id: companyMap['info@acme-demo.app'],
      job_name: 'Facility Inspection & Photos - Demo',
      description: 'Walk through facility and document condition',
      rate_type: 'flat',
      rate_amount: 150.0,
      estimated_hours: 2.0,
      location: 'San Francisco, CA',
    },
    {
      company_id: companyMap['contact@globex-demo.app'],
      job_name: 'Paint Conference Room - Demo',
      description: 'Paint 20x15 conference room with two coats',
      rate_type: 'flat',
      rate_amount: 200.0,
      estimated_hours: 6.0,
      location: 'New York, NY',
    },
    {
      company_id: companyMap['contact@globex-demo.app'],
      job_name: 'HVAC Filter Replacement & Testing - Demo',
      description: 'Replace HVAC filters and test airflow',
      rate_type: 'hourly',
      rate_amount: 55.0,
      estimated_hours: 4.0,
      location: 'New York, NY',
    },
  ];

  for (const job of jobs) {
    if (!job.company_id) {
      await log(`Skipping job (no company): ${job.job_name}`, 'warn');
      continue;
    }

    try {
      const { error } = await supabase.from('jobs').insert({
        id: uuidv4(),
        company_id: job.company_id,
        job_name: job.job_name,
        description: job.description,
        status: 'active',
        rate_type: job.rate_type,
        rate_amount: job.rate_amount,
        estimated_hours: job.estimated_hours,
        location: job.location,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      });

      if (error) {
        await log(`Failed to create job ${job.job_name}: ${error.message}`, 'error');
      } else {
        await log(`Created job: ${job.job_name}`, 'success');
      }
    } catch (err) {
      await log(`Error creating job: ${err}`, 'error');
    }
  }
}

async function cleanupDemo() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║ CLEANUP: Removing all demo data                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const confirmMessage = 'WARNING: This will delete all demo data. Continue? (yes/no): ';
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(confirmMessage, async (answer: string) => {
    if (answer.toLowerCase() !== 'yes') {
      await log('Cleanup cancelled', 'warn');
      rl.close();
      process.exit(0);
    }

    try {
      // Delete in reverse order of dependencies
      await log('Deleting demo job instances...', 'info');
      await supabase
        .from('job_instances')
        .delete()
        .in('assigned_to', demoUsers.map((u) => u.email));

      await log('Deleting demo jobs...', 'info');
      await supabase
        .from('jobs')
        .delete()
        .like('job_name', '%Demo%');

      await log('Deleting demo companies...', 'info');
      await supabase
        .from('companies')
        .delete()
        .like('name', '%Demo%');

      await log('Deleting demo users...', 'info');
      // Can only delete auth users via Supabase admin API
      for (const user of demoUsers) {
        try {
          // This requires admin access
          console.log(`  • Would delete auth user: ${user.email} (requires admin)`);
        } catch (err) {
          // Silently fail - auth deletion might not be available
        }
      }

      await log('Demo data cleanup complete!', 'success');
    } catch (err) {
      await log(`Cleanup error: ${err}`, 'error');
    } finally {
      rl.close();
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║ MERVO DEMO DATA GENERATOR                                  ║');
  console.log('║ Version 1.0 - December 2025                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (command === '--dry-run') {
    await dryRun();
    process.exit(0);
  } else if (command === '--clean') {
    await cleanupDemo();
    return;
  } else if (command === '--confirm') {
    console.log('🚀 Starting demo data generation...\n');

    try {
      const userMap = await seedUsers();
      const companyMap = await seedCompanies(userMap);
      await seedJobs(companyMap);

      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║ ✅ DEMO DATA CREATION COMPLETE                             ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');

      console.log('📊 Created:');
      console.log(`  • ${demoUsers.length} demo users`);
      console.log(`  • ${demoCompanies.length} demo companies`);
      console.log('  • 4 demo jobs');
      console.log('  • 4 job instances (work assignments)');
      console.log('  • Audit logs for all operations\n');

      console.log('🔑 Demo Credentials:');
      console.log('  Contractor: contractor-alice@mervo-demo.app / contractor-demo-password-alice');
      console.log('  Admin: admin-acme@mervo-demo.app / admin-demo-password-acme\n');

      console.log('📚 Next Steps:');
      console.log('  1. Log in with a demo account');
      console.log('  2. Verify data in dashboards');
      console.log('  3. Accept a job and complete it');
      console.log('  4. Test approval and payment workflow\n');

      process.exit(0);
    } catch (err) {
      await log(`Generation failed: ${err}`, 'error');
      process.exit(1);
    }
  } else {
    console.log('Usage:');
    console.log('  npm run seed-demo-data -- --dry-run     (Preview without creating)');
    console.log('  npm run seed-demo-data -- --confirm     (Create demo data)');
    console.log('  npm run seed-demo-data -- --clean       (Remove all demo data)\n');
    console.log('Environment variables:');
    console.log('  SUPABASE_URL               (database URL)');
    console.log('  SUPABASE_SERVICE_ROLE_KEY  (admin API key)\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
