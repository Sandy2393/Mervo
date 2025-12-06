# Demo Uploads

This folder documents how to upload demo images/files to Supabase Storage for local/demo environments.

## Steps
1. Prepare 3–5 small demo images (under 500 KB each). Use non-sensitive, license-free images.
2. Create a public or authenticated bucket in Supabase Storage (e.g., `job-photos-demo`).
3. Upload files manually via Supabase Dashboard or with the Supabase CLI.
   ```bash
   # Example CLI upload (replace placeholders)
   supabase storage upload --bucket job-photos-demo --path photos/photo1.jpg ./local/photo1.jpg
   ```
4. Record the public URLs (or signed URLs) after upload.
5. Insert rows into `job_photos` (if the table exists) using the URLs. See `demo/seed_data.sql` for an example placeholder insert.

## TODOs
- [ ] Replace bucket name with your actual demo bucket
- [ ] Replace URLs with the uploaded file URLs
- [ ] If `job_photos` table is missing, add a migration or use `supabase_schema_addons.sql`
