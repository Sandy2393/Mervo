/**
 * Retention cleanup script (template)
 * - Lists media older than company.retention_days
 * - Archives to secondary storage or marks for deletion
 *
 * IMPORTANT: This script requires a SERVICE_ROLE_KEY and must run server-side with privileges.
 * TODO: Replace placeholders and implement secure storage and deletion steps.
 */

const fetch = require('node-fetch');

async function run() {
  const SUPABASE_URL = process.env.SUPABASE_URL || 'REPLACE_SUPABASE_URL';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'REPLACE_SERVICE_ROLE_KEY';

  if (SERVICE_KEY.includes('REPLACE')) {
    console.error('Service key not set. Set SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
  }

  // Example: fetch companies and their retention_days
  const companiesResp = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=id,retention_days`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  });
  const companies = await companiesResp.json();

  for (const c of companies) {
    const retention = c.retention_days || 180;
    console.log(`Company ${c.id} retention days: ${retention}`);

    // Calculate threshold
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - retention);
    const iso = thresholdDate.toISOString();

    // TODO: Query job_photos/job_instances older than iso and either archive or delete
    // Example placeholder:
    console.log(`Would archive media older than ${iso} for company ${c.id}.`);
  }
}

if (require.main === module) {
  run().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
