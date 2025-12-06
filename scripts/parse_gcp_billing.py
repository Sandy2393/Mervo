#!/usr/bin/env python3
"""
Parse GCP billing CSV export and aggregate per service and per company (heuristic labels).
Usage: python scripts/parse_gcp_billing.py --input billing.csv --output per_company.json [--dry-run]

Heuristics:
- Try label 'labels.company_tag' or 'labels.company_id'
- Fallback: parse resource name for company alias
- Unmapped rows written to reports/unmapped_rows_<date>.csv
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
    for key in ("labels.company_tag", "labels.company_id"):
        if key in row and row[key]:
            return row[key]
    name = row.get("resource.name", "")
    if "company-" in name:
        return name.split("company-")[-1].split("/")[0]
    return None


def main():
    args = parse_args()
    per_company = defaultdict(lambda: defaultdict(float))
    per_service = defaultdict(float)
    unmapped = []

    with open(args.input, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cost = float(row.get("cost", 0) or 0)
            service = row.get("service.description", "unknown")
            company = map_company(row)
            if company:
                per_company[company][service] += cost
            else:
                unmapped.append(row)
            per_service[service] += cost

    output = {"per_company": per_company, "per_service": per_service}
    # convert defaultdicts to normal dicts
    output["per_company"] = {c: dict(svcs) for c, svcs in per_company.items()}
    output["per_service"] = dict(per_service)

    if args.dry_run:
        print(json.dumps(output, indent=2))
    else:
        with open(args.output, "w") as out:
            json.dump(output, out, indent=2)

    if unmapped:
        os.makedirs("reports", exist_ok=True)
        fname = f"reports/unmapped_rows_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        with open(fname, "w", newline="") as uf:
            writer = csv.DictWriter(uf, fieldnames=unmapped[0].keys())
            writer.writeheader()
            writer.writerows(unmapped)
        print(f"Wrote unmapped rows to {fname}")

    print("Done")


if __name__ == "__main__":
    main()
