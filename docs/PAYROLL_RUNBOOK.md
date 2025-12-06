# Payroll Runbook

## Steps
1) Create payout batch (scheduled date, creator id).
2) Add payout lines (contractor, amount_cents, currency).
3) Approve batch (approver id captured).
4) Process batch with dry-run first; review simulated provider payloads.
5) Re-run with `confirm=true` to execute live payouts.

## Failure modes
- Account not connected: payout fails; requeue after contractor fixes account.
- Insufficient funds: provider rejects; keep batch in failed state, top-up balance, reprocess.
- Network/provider errors: retry with idempotency keys (TODO in provider client).

## Rollback
- If live payout misfires, coordinate with provider support; update payout status notes; avoid double-paying by checking provider payout id.

## Monitoring
- Track batch status counts; alert on failed > 0.
- Log every provider call with request/response ids.
