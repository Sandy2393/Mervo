# Product Prioritization

## Method
Using RICE (Reach, Impact, Confidence, Effort) to score features.
- Score = (Reach * Impact * Confidence) / Effort
- Reach: users/week; Impact: 3=high,2=med,1=low; Confidence: %; Effort: person-weeks.

## Example Scoring
| Item | Reach | Impact | Confidence | Effort | RICE |
|------|-------|--------|------------|--------|------|
| Feedback admin dashboard | 200 | 2 | 0.8 | 1 | 320 |
| Payroll export v1 | 150 | 3 | 0.7 | 2 | 157.5 |
| Offline queue visibility | 300 | 2 | 0.6 | 2 | 180 |
| SSO/SAML | 80 | 3 | 0.7 | 4 | 42 |

## Sample Priority List
1) Feedback admin dashboard (P0) — fastest route to close loop and reduce churn.
2) Offline queue visibility (P1) — improves reliability perception.
3) Payroll export v1 (P1) — unlocks payroll buyers.
4) SSO/SAML (P0 for enterprise accounts) — required for larger deals.

## TODO
- TODO: Replace estimates with team sizing; recalc quarterly.
