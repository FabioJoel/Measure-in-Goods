#!/usr/bin/env python3
"""
Fetch daily S&P 500 price data from the FRED API and persist it locally.

Usage:
    FRED_API_KEY=your_key python data/fetch_sp500_fred.py --output data/external/sp500_fred_daily.csv

Optional flags let you adjust the date window or output format.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from datetime import date
from pathlib import Path
from typing import Iterable, Mapping, Sequence

import requests

FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--api-key",
        default=os.environ.get("FRED_API_KEY"),
        help="FRED API key (defaults to environment variable FRED_API_KEY)",
    )
    parser.add_argument(
        "--start-date",
        default="2010-01-01",
        help="ISO start date for observations (default: 2010-01-01)",
    )
    parser.add_argument(
        "--end-date",
        default=date.today().isoformat(),
        help="ISO end date for observations (default: today)",
    )
    parser.add_argument(
        "--series-id",
        default="SP500",
        help="FRED series identifier (default: SP500)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/external/sp500_fred_daily.csv"),
        help="Destination CSV file (default: data/external/sp500_fred_daily.csv)",
    )
    parser.add_argument(
        "--format",
        choices=("csv", "json"),
        default="csv",
        help="Output format (default: csv)",
    )
    parser.add_argument(
        "--frequency",
        default="d",
        help="FRED frequency code (default: daily 'd')",
    )
    return parser.parse_args()


def fetch_observations(
    api_key: str,
    series_id: str,
    start_date: str,
    end_date: str,
    frequency: str = "d",
) -> Sequence[Mapping[str, str]]:
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "observation_start": start_date,
        "observation_end": end_date,
        "frequency": frequency,
        "sort_order": "asc",
    }

    response = requests.get(FRED_BASE_URL, params=params, timeout=30)
    response.raise_for_status()
    payload = response.json()
    observations = payload.get("observations", [])

    if not isinstance(observations, list):
        raise ValueError("Unexpected response payload structure")

    return [
        {"date": obs["date"], "value": obs["value"]}
        for obs in observations
        if obs.get("value") not in (None, ".", "")
    ]


def ensure_destination(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def write_csv(path: Path, rows: Iterable[Mapping[str, str]]) -> None:
    ensure_destination(path)
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=["date", "value"])
        writer.writeheader()
        writer.writerows(rows)


def write_json(
    path: Path,
    rows: Sequence[Mapping[str, str]],
    series_id: str,
) -> None:
    ensure_destination(path)
    with path.open("w", encoding="utf-8") as fh:
        json.dump({"series_id": series_id, "observations": rows}, fh, indent=2)


def main() -> int:
    args = parse_args()

    if not args.api_key:
        print("FRED API key not provided. Set FRED_API_KEY or pass --api-key.", file=sys.stderr)
        return 1

    try:
        observations = fetch_observations(
            api_key=args.api_key,
            series_id=args.series_id,
            start_date=args.start_date,
            end_date=args.end_date,
            frequency=args.frequency,
        )
    except requests.HTTPError as exc:
        print(f"Failed to fetch data from FRED ({exc.response.status_code}): {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"Failed to fetch data from FRED: {exc}", file=sys.stderr)
        return 1

    if args.format == "csv":
        write_csv(args.output, observations)
    else:
        write_json(args.output, observations, args.series_id)

    print(
        f"Saved {len(observations)} observations for {args.series_id} to {args.output}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
