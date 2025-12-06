#!/usr/bin/env python3
"""
Generate invoice drafts from usage JSON (per-company allocations).
Usage: python scripts/generate_invoice_from_usage.py --input per_company.json --output-dir invoices --month 2025-12
Uses integer cents to avoid float issues.
"""
import argparse
import json
import os
from datetime import datetime

STORAGE_RATE_PER_GB_MONTH_CENTS = 2  # placeholder
EGRESS_RATE_PER_GB_CENTS = 8
FUNCTION_RATE_PER_1M_CENTS = 20


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output-dir", required=True)
    p.add_argument("--month", required=True, help="YYYY-MM")
    p.add_argument("--dry-run", action="store_true")
    return p.parse_args()


def main():
    args = parse_args()
    with open(args.input) as f:
      data = json.load(f)

    per_company = data.get("per_company", {})
    os.makedirs(args.output_dir, exist_ok=True)

    for company, services in per_company.items():
      storage_gb = services.get("Storage", 0)
      egress_gb = services.get("Egress", 0)
      functions_m = services.get("Functions", 0) / 1_000_000

      storage_cents = int(storage_gb * STORAGE_RATE_PER_GB_MONTH_CENTS)
      egress_cents = int(egress_gb * EGRESS_RATE_PER_GB_CENTS)
      func_cents = int(functions_m * FUNCTION_RATE_PER_1M_CENTS)
      total_cents = storage_cents + egress_cents + func_cents

      invoice = {
        "company": company,
        "month": args.month,
        "line_items": [
          {"item": "Storage", "quantity_gb_month": storage_gb, "amount_cents": storage_cents},
          {"item": "Egress", "quantity_gb": egress_gb, "amount_cents": egress_cents},
          {"item": "Functions", "quantity_m": functions_m, "amount_cents": func_cents},
        ],
        "total_cents": total_cents
      }

      out_path = os.path.join(args.output_dir, f"company_{company}_{args.month.replace('-', '')}.json")
      if args.dry_run:
        print(json.dumps(invoice, indent=2))
      else:
        with open(out_path, "w") as out:
          json.dump(invoice, out, indent=2)
        print(f"Wrote {out_path}")

    print("Done")


if __name__ == "__main__":
    main()
