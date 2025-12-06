/**
 * Environment Configuration for Mervo Frontend
 * 
 * TODO: CRITICAL — Replace all placeholder values before deploying.
 * 
 * DO NOT commit real values. Instead:
 * - Store secrets in your CI/CD platform (GitHub Actions, GitLab CI, etc.)
 * - For Vercel/Netlify: use Environment Variables in dashboard
 * - For Supabase Cloud: use project settings or secure env storage
 * - For Cloud Run/Docker: inject at runtime, never in code
 * 
 * Safe storage locations:
 * 1. GitHub Secrets → pass to Actions → set as build env vars
 * 2. Vercel/Netlify Environment Variables dashboard
 * 3. Supabase project settings → Copy anon key and URL from there
 * 4. Cloud provider managed secrets (AWS Secrets Manager, etc.)
 * 
 * NEVER paste secrets into Google AI Studio, ChatGPT, or any LLM.
 */

export const ENV = {
  SUPABASE_URL: 'https://lnaghkkodbguhwhffiyl.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuYWdoa2tvZGJndWh3aGZmaXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTEzMTcsImV4cCI6MjA4MDQyNzMxN30.pTJtS5RDnXbR_rfRQ4HMohWVUwXqGK_qzKOsb85mTaE',
  APP_ID: 'MERVO',
  APP_TAG: 'mervo'
} as const;

// Safety check: warn if placeholders remain in production
if (typeof window !== 'undefined' && ENV.SUPABASE_URL.includes('REPLACE_ME')) {
  console.error(
    '[MERVO] Environment variables not configured. ' +
    'See README.md for setup instructions. ' +
    'Replace placeholders in src/config/env.ts or via CI/CD environment variables.'
  );
}
