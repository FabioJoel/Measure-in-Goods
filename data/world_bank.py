"""Placeholder module for fetching World Bank data series and preparing them for basket calculations."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Iterable, Protocol

from .fred import TimeSeriesPoint


class HttpClient(Protocol):
    """Minimal HTTP client abstraction for dependency injection."""

    def get_json(self, url: str, params: dict[str, str] | None = None) -> dict:
        """Retrieve JSON payload for a given URL."""


@dataclass
class WorldBankDataSource:
    """Interface for retrieving, filtering, and normalizing World Bank indicators."""

    client: HttpClient

    def fetch_indicator(self, indicator: str, *, country: str, start: date | None = None, end: date | None = None) -> list[TimeSeriesPoint]:
        """Load an indicator for a specific country and map it onto normalized time series points."""

        # Actual implementation will parse the World Bank API's two-element array
        # response format and collapse it into ``TimeSeriesPoint`` records.
        raise NotImplementedError

    def list_indicators(self, topic: str | None = None) -> Iterable[str]:
        """Return identifiers for indicators that the application may expose."""

        # Implementations can leverage the World Bank metadata endpoints to expose
        # curated lists of indicators relevant for purchasing power comparisons.
        raise NotImplementedError
