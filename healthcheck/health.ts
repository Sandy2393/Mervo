import express from 'express';
import { supabase } from '../src/lib/supabase';

// Simple health endpoint. Deploy this as a tiny Cloud Run service or lambda to monitor app health.
const app = express();
const port = process.env.PORT || 8080;

app.get('/health', async (req, res) => {
  try {
    // Lightweight check: fetch a single company row (requires service key in server deployment)
    // TODO: use a service role key server-side to run an admin query for deeper checks.
    // For now, return application status only.
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err instanceof Error ? err.message : 'unknown' });
  }
});

app.listen(port, () => console.log(`Health check listening on ${port}`));
