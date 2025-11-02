"""Data source integrations for economic time series."""

from .fred import FredDataSource
from .sample_series import get_gold_series, get_sp500_series
from .world_bank import WorldBankDataSource

__all__ = [
    "FredDataSource",
    "WorldBankDataSource",
    "get_gold_series",
    "get_sp500_series",
]
