#!/usr/bin/env python3
"""Download XAUUSD spot daily data from Stooq and persist it locally."""

from __future__ import annotations

import argparse
import csv
from datetime import datetime
from pathlib import Path
from typing import Iterable

import requests

STOOQ_CSV_URL = "https://stooq.com/q/d/l/?s=xauusd&i=d"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("frontend/public/data/xauusd.json"),
        help="Destination JSON file (default: frontend/public/data/xauusd.json)",
    )
    return parser.parse_args()


def fetch_csv_rows(url: str) -> list[dict[str, str]]:
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    response.encoding = "utf-8"

    rows: list[dict[str, str]] = []
    reader = csv.DictReader(response.text.splitlines())
    for row in reader:
        date_str = row.get("Date")
        close_str = row.get("Close")
        if not date_str or not close_str or close_str in ("-", ""):
            continue
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            value = float(close_str)
        except ValueError:
            continue
        rows.append({"date": dt.date().isoformat(), "value": value})
    return rows


def ensure_destination(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, rows: Iterable[dict[str, str]]) -> None:
    import json

    ensure_destination(path)
    payload = {
        "series_id": "XAUUSD_STOOQ",
        "observations": list(rows),
        "source": "Stooq XAUUSD daily csv",
        "url": STOOQ_CSV_URL,
    }
    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)


def main() -> int:
    args = parse_args()
    try:
        rows = fetch_csv_rows(STOOQ_CSV_URL)
    except Exception as exc:
        print(f"Failed to download XAUUSD data from Stooq: {exc}")
        return 1

    if not rows:
        print("No observations retrieved from Stooq.")
        return 1

    write_json(args.output, rows)
    print(f"Saved {len(rows)} observations to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
