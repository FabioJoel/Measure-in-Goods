"""Sample time series for early iteration demos."""

from __future__ import annotations

import json
import logging
import os
from datetime import date
from pathlib import Path
from typing import Sequence

from .fred import TimeSeriesPoint

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DATA_DIR = PROJECT_ROOT / "frontend" / "public" / "data"


def _series_from_rows(rows: Sequence[tuple[str, float]]) -> list[TimeSeriesPoint]:
    """Build :class:`TimeSeriesPoint` objects from ISO date rows."""

    return [
        TimeSeriesPoint(timestamp=date.fromisoformat(timestamp), value=value)
        for timestamp, value in rows
    ]


def get_sp500_series() -> list[TimeSeriesPoint]:
    """Return S&P 500 closing levels from local data if available.

    Falls back to a 2023 month-end sample series when the project data snapshot
    has not been generated yet.
    """

    dataset_path = Path(
        os.environ.get("SP500_SERIES_PATH", PUBLIC_DATA_DIR / "sp500.json")
    )
    series = _series_from_json(dataset_path, label="sp500")
    if series:
        return series

    logger.warning(
        "Using built-in fallback sample for SP500 series; dataset not available."
    )
    rows = [
        ("2023-01-31", 4076.60),
        ("2023-02-28", 3970.15),
        ("2023-03-31", 4109.31),
        ("2023-04-28", 4169.48),
        ("2023-05-31", 4179.83),
        ("2023-06-30", 4450.38),
        ("2023-07-31", 4588.96),
        ("2023-08-31", 4507.66),
        ("2023-09-29", 4288.05),
        ("2023-10-31", 4193.80),
        ("2023-11-30", 4567.80),
        ("2023-12-29", 4769.83),
    ]

    return _series_from_rows(rows)


def get_gold_series() -> list[TimeSeriesPoint]:
    """Return gold spot prices in USD from local data when available.

    Falls back to a 2023 month-end sample series if no snapshot exists yet.
    """

    dataset_path = Path(
        os.environ.get("GOLD_SERIES_PATH", PUBLIC_DATA_DIR / "xauusd.json")
    )
    series = _series_from_json(dataset_path, label="gold")
    if series:
        return series

    logger.warning(
        "Using built-in fallback sample for gold series; dataset not available."
    )
    rows = [
        ("2023-01-31", 1928.36),
        ("2023-02-28", 1836.87),
        ("2023-03-31", 1969.28),
        ("2023-04-28", 1983.62),
        ("2023-05-31", 1961.77),
        ("2023-06-30", 1919.35),
        ("2023-07-31", 1966.19),
        ("2023-08-31", 1940.53),
        ("2023-09-29", 1847.25),
        ("2023-10-31", 1983.79),
        ("2023-11-30", 2041.79),
        ("2023-12-29", 2062.98),
    ]

    return _series_from_rows(rows)


def get_usd_chf_series() -> list[TimeSeriesPoint]:
    """Return 2023 month-end USD/CHF FX rates (CHF per USD)."""

    rows = [
        ("2023-01-31", 0.922),
        ("2023-02-28", 0.938),
        ("2023-03-31", 0.915),
        ("2023-04-28", 0.894),
        ("2023-05-31", 0.912),
        ("2023-06-30", 0.898),
        ("2023-07-31", 0.876),
        ("2023-08-31", 0.883),
        ("2023-09-29", 0.912),
        ("2023-10-31", 0.902),
        ("2023-11-30", 0.904),
        ("2023-12-29", 0.866),
    ]

    return _series_from_rows(rows)


def _series_from_json(path: Path, *, label: str) -> list[TimeSeriesPoint]:
    """Load a FRED-style JSON snapshot into :class:`TimeSeriesPoint` records."""

    try:
        with path.open("r", encoding="utf-8") as fh:
            payload = json.load(fh)
    except FileNotFoundError:
        logger.warning("Dataset '%s' not found at %s", label, path)
        return []
    except json.JSONDecodeError as exc:
        logger.warning("Dataset '%s' at %s is not valid JSON: %s", label, path, exc)
        return []

    observations = payload.get("observations")
    if not isinstance(observations, list):
        logger.warning(
            "Dataset '%s' at %s is missing an 'observations' list", label, path
        )
        return []

    points: list[TimeSeriesPoint] = []
    for entry in observations:
        if not isinstance(entry, dict):
            continue

        raw_date = entry.get("date")
        raw_value = entry.get("value")
        if raw_date in (None, "") or raw_value in (None, ".", ""):
            continue

        try:
            parsed_date = date.fromisoformat(raw_date)
        except ValueError:
            logger.debug("Skipping %s entry with invalid date %r", label, raw_date)
            continue

        try:
            numeric_value = float(raw_value)
        except (TypeError, ValueError):
            logger.debug("Skipping %s entry with invalid value %r", label, raw_value)
            continue

        points.append(TimeSeriesPoint(timestamp=parsed_date, value=numeric_value))

    points.sort(key=lambda item: item.timestamp)

    if points:
        logger.info(
            "Loaded %s observations for '%s' from %s", len(points), label, path
        )
    else:
        logger.warning("Dataset '%s' at %s contained no valid observations", label, path)

    return points
