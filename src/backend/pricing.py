"""Pricing and ratio computation utilities."""

from __future__ import annotations

from datetime import date, timedelta
from typing import List, Sequence

from .models import AssetSelection, BasketComputationRequest, BasketComposition, BasketSeriesPoint
from data.fred import TimeSeriesPoint
from data.sample_series import get_gold_series, get_sp500_series


class PricingEngine:
    """Compute blended baskets using normalized asset data."""

    def compute(self, request: BasketComputationRequest) -> BasketComposition:
        """Placeholder computation that simulates a time series output."""

        # The implementation will eventually merge normalized time series retrieved
        # from the data layer. For now we return a synthetic series to demonstrate
        # the shape of the response structure.
        points = self._generate_placeholder_series(request.assets)
        return BasketComposition(name="synthetic-basket", points=points)

    def compute_sp500_in_gold(self) -> BasketComposition:
        """Return the S&P 500 priced in ounces of gold using sample data."""

        return self._compute_ratio(
            numerator=get_sp500_series(),
            denominator=get_gold_series(),
            name="sp500-in-gold",
        )

    def _generate_placeholder_series(self, assets: List[AssetSelection]) -> list[BasketSeriesPoint]:
        """Create a short synthetic series to unblock frontend development."""

        base_date = date.today() - timedelta(days=30)
        return [
            BasketSeriesPoint(timestamp=base_date + timedelta(days=i), value=100 + i)
            for i, _asset in enumerate(range(5))
        ]

    def _compute_ratio(
        self,
        *,
        numerator: Sequence[TimeSeriesPoint],
        denominator: Sequence[TimeSeriesPoint],
        name: str,
    ) -> BasketComposition:
        """Calculate a ratio from two aligned series with defensive guards."""

        denominator_lookup = {point.timestamp: point.value for point in denominator}
        ratio_points: list[BasketSeriesPoint] = []

        for point in numerator:
            denominator_value = denominator_lookup.get(point.timestamp)
            if denominator_value in (None, 0):
                continue

            ratio_points.append(
                BasketSeriesPoint(
                    timestamp=point.timestamp,
                    value=point.value / denominator_value,
                )
            )

        ratio_points.sort(key=lambda entry: entry.timestamp)
        return BasketComposition(name=name, points=ratio_points)
