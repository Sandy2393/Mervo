import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnaghkkodbguhwhffiyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuYWdoa2tvZGJndWh3aGZmaXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTEzMTcsImV4cCI6MjA4MDQyNzMxN30.pTJtS5RDnXbR_rfRQ4HMohWVUwXqGK_qzKOsb85mTaE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
  try {
    const tables = ['companies', 'users', 'jobs', 'job_instances', 'timesheets'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: accessible`);
      }
    }
    console.log('\nSchema verification complete!');
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

checkSchema();
