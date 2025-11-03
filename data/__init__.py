"""Data source utilities for economic time series."""

from .fred import TimeSeriesPoint
from .sample_series import get_gold_series, get_sp500_series

__all__ = [
    "TimeSeriesPoint",
    "get_gold_series",
    "get_sp500_series",
]
