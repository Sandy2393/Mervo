import { createClient } from '@supabase/supabase-js';
import { ENV } from './src/config/env.ts';

const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

async function checkSchema() {
  try {
    // Test tables
    const tables = ['companies', 'users', 'jobs', 'job_instances', 'timesheets'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count()')
        .limit(1);
      
      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists`);
      }
    }
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

checkSchema();
