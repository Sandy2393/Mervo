#!/usr/bin/env python3
"""
Simple cost simulator for storage/egress/function usage.
Usage:
  python scripts/cost_simulator.py --company demo --jobs-per-day 50 --photos-per-job 3 --photo-size 150 --retention 365
Costs are placeholders; update with real unit prices.
"""
import argparse
import json

STORAGE_PRICE_PER_GB_MONTH = 0.02
EGRESS_PRICE_PER_GB = 0.08
FUNCTION_PRICE_PER_1M = 0.20


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--company", required=True)
    p.add_argument("--jobs-per-day", type=int, required=True)
    p.add_argument("--photos-per-job", type=int, required=True)
    p.add_argument("--photo-size", type=int, help="KB per photo", required=True)
    p.add_argument("--retention", type=int, help="days", required=True)
    return p.parse_args()


def main():
    args = parse_args()
    photos_per_day = args.jobs_per_day * args.photos_per_job
    bytes_per_day = photos_per_day * args.photo_size * 1024
    gb_per_month = (bytes_per_day * 30) / 1_000_000_000
    storage_cost = gb_per_month * STORAGE_PRICE_PER_GB_MONTH

    egress_gb = gb_per_month * 0.2  # assume 20% viewed/downloaded
    egress_cost = egress_gb * EGRESS_PRICE_PER_GB

    func_invocations = args.jobs_per_day * 10 * 30  # rough estimate
    func_cost = (func_invocations / 1_000_000) * FUNCTION_PRICE_PER_1M

    total = storage_cost + egress_cost + func_cost
    result = {
      "company": args.company,
      "storage_gb_month": round(gb_per_month, 2),
      "storage_cost": round(storage_cost, 2),
      "egress_gb": round(egress_gb, 2),
      "egress_cost": round(egress_cost, 2),
      "function_invocations": int(func_invocations),
      "function_cost": round(func_cost, 4),
      "total_cost": round(total, 2)
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
