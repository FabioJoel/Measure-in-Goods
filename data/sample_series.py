"""Sample time series for early iteration demos."""

from __future__ import annotations

from datetime import date
from typing import Sequence

from .fred import TimeSeriesPoint


def _series_from_rows(rows: Sequence[tuple[str, float]]) -> list[TimeSeriesPoint]:
    """Build :class:`TimeSeriesPoint` objects from ISO date rows."""

    return [
        TimeSeriesPoint(timestamp=date.fromisoformat(timestamp), value=value)
        for timestamp, value in rows
    ]


def get_sp500_series() -> list[TimeSeriesPoint]:
    """Return 2023 month-end S&P 500 closing levels."""

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
    """Return 2023 month-end gold spot prices in USD per troy ounce."""

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
