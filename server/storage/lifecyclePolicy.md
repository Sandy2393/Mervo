# Storage Lifecycle Recommendations

- Photos (before/after): hot for 90 days, transition to cold/archive afterwards; delete after 2 years if policy allows.
- PDFs: keep for 7 years; replicate to compliant storage if required.
- Zips (bulk exports): expire after 30 days to save space.
- Use bucket object lifecycle rules; prefix patterns:
  - `company/*/jobs/*/photos/*`
  - `company/*/reports/*`
  - `company/*/*/reports_*.zip`
