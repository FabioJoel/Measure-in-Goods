"""Placeholder module for fetching time series data from the Federal Reserve Economic Data (FRED) API."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Iterable, List, Protocol


@dataclass
class TimeSeriesPoint:
    """Normalized representation of a single observation."""

    timestamp: date
    value: float


class HttpClient(Protocol):
    """Protocol representing an HTTP client implementation."""

    def get_json(self, url: str, params: dict[str, str] | None = None) -> dict:
        """Retrieve JSON payload for a given URL."""


@dataclass
class FredDataSource:
    """High-level interface for retrieving and normalizing FRED time series."""

    api_key: str
    client: HttpClient

    def fetch_series(self, series_id: str, *, start: date | None = None, end: date | None = None) -> List[TimeSeriesPoint]:
        """Fetch a time series and normalize it into :class:`TimeSeriesPoint` records."""

        # The actual implementation will issue HTTP requests via ``self.client``
        # and transform the returned data into the normalized schema.
        raise NotImplementedError

    def list_available_series(self, category: str | None = None) -> Iterable[str]:
        """Return identifiers for selectable FRED series."""

        # Future implementation might call the FRED category API endpoints to
        # construct curated lists of relevant macroeconomic series.
        raise NotImplementedError
