#!/usr/bin/env python3
"""
retention_analysis.py
Placeholder retention/cohort analysis.
Usage:
  python scripts/retention_analysis.py --csv data/export.csv [--dry-run]

CSV requirements (example columns): user_id, company_id, job_id, event_date (ISO), event_type
Outputs basic cohort/churn metrics to stdout.
"""
import argparse
import sys
from datetime import datetime
import pandas as pd


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="Path to CSV export")
    parser.add_argument("--dry-run", action="store_true", help="Run without heavy calculations")
    return parser.parse_args()


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    required = {"user_id", "event_date"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    df["event_date"] = pd.to_datetime(df["event_date"], errors="coerce")
    return df.dropna(subset=["event_date", "user_id"])


def weekly_active_users(df: pd.DataFrame) -> pd.DataFrame:
    df["week"] = df["event_date"].dt.to_period("W").dt.start_time
    wau = df.groupby("week")["user_id"].nunique().reset_index(name="wau")
    return wau


def cohorts(df: pd.DataFrame) -> pd.DataFrame:
    df["signup_week"] = df.groupby("user_id")['event_date'].transform('min').dt.to_period('W').dt.start_time
    df["active_week"] = df["event_date"].dt.to_period("W").dt.start_time
    cohort = (
        df.groupby(["signup_week", "active_week"])["user_id"].nunique()
        .reset_index(name="active_users")
    )
    cohort["weeks_since_signup"] = ((cohort["active_week"] - cohort["signup_week"]).dt.days // 7)
    return cohort


def churn_rate(df: pd.DataFrame) -> float:
    first = df.groupby("user_id")["event_date"].min()
    last = df.groupby("user_id")["event_date"].max()
    active_cutoff = df["event_date"].max() - pd.Timedelta(days=30)
    churned = (last < active_cutoff).sum()
    total = len(first)
    return churned / total if total else 0.0


def main():
    args = parse_args()
    df = load_data(args.csv)

    if args.dry_run:
        print("[dry-run] loaded rows:", len(df))
        sys.exit(0)

    wau = weekly_active_users(df)
    cohort = cohorts(df)
    churn = churn_rate(df)

    print("Weekly Active Users:\n", wau.tail())
    print("\nCohorts (last 5 rows):\n", cohort.tail())
    print(f"\nEstimated churn rate (30d inactive): {churn:.2%}")


if __name__ == "__main__":
    main()
