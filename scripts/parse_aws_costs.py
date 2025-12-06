#!/usr/bin/env python3
"""
Parse AWS Cost & Usage CSV export (placeholder) and produce per-company aggregates.
Usage: python scripts/parse_aws_costs.py --input aws_cost.csv --output per_company.json [--dry-run]
Heuristic mapping: use tags (company_tag) or ResourceId patterns.
"""
import argparse
import csv
import json
import os
from collections import defaultdict
from datetime import datetime


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--dry-run", action="store_true")
    return p.parse_args()


def map_company(row):
    for key in ("resourceTags/company_tag", "resourceTags/company_id"):
        if key in row and row[key]:
            return row[key]
    rid = row.get("ResourceId", "")
    if "company-" in rid:
        return rid.split("company-")[-1].split("/")[0]
    return None


def main():
    args = parse_args()
    per_company = defaultdict(lambda: defaultdict(float))
    per_service = defaultdict(float)
    unmapped = []

    with open(args.input, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cost = float(row.get("UnblendedCost", 0) or 0)
            service = row.get("ProductName", "unknown")
            company = map_company(row)
            if company:
                per_company[company][service] += cost
            else:
                unmapped.append(row)
            per_service[service] += cost

    output = {"per_company": {c: dict(svcs) for c, svcs in per_company.items()}, "per_service": dict(per_service)}

    if args.dry_run:
        print(json.dumps(output, indent=2))
    else:
        with open(args.output, "w") as out:
            json.dump(output, out, indent=2)

    if unmapped:
        os.makedirs("reports", exist_ok=True)
        fname = f"reports/unmapped_rows_aws_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        with open(fname, "w", newline="") as uf:
            writer = csv.DictWriter(uf, fieldnames=unmapped[0].keys())
            writer.writeheader()
            writer.writerows(unmapped)
        print(f"Wrote unmapped rows to {fname}")

    print("Done")


if __name__ == "__main__":
    main()
