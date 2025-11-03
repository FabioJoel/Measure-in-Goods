"""Pricing and ratio computation utilities."""

from __future__ import annotations

from typing import Sequence

from .models import BasketComputationRequest, BasketComposition, BasketSeriesPoint
from data.fred import TimeSeriesPoint
from data.sample_series import (
    get_gold_series,
    get_sp500_series,
    get_usd_chf_series,
)

TROY_OUNCES_PER_KILOGRAM = 32.1507466
GRAMS_PER_TROY_OUNCE = 31.1034768


class PricingEngine:
    """Compute blended baskets using normalized asset data."""

    def compute(self, request: BasketComputationRequest) -> BasketComposition:
        """Placeholder computation that simulates a time series output."""

        raise NotImplementedError(
            "Basket computation is not implemented. Use specific ratio helpers instead."
        )

    def compute_sp500_in_gold(self) -> BasketComposition:
        """Return the S&P 500 priced in ounces of gold using sample data."""

        return self._compute_ratio(
            numerator=get_sp500_series(),
            denominator=get_gold_series(),
            name="sp500-in-gold",
        )

    def compute_sp500_in_usd(self) -> BasketComposition:
        """Return the S&P 500 priced in USD using sample data."""

        points = [
            BasketSeriesPoint(timestamp=point.timestamp, value=point.value)
            for point in get_sp500_series()
        ]
        return BasketComposition(name="sp500-in-usd", points=points)

    def compute_sp500_in_chf(self) -> BasketComposition:
        """Return the S&P 500 priced in Swiss francs using sample data."""

        fx_lookup = {point.timestamp: point.value for point in get_usd_chf_series()}
        converted: list[BasketSeriesPoint] = []

        for point in get_sp500_series():
            rate = fx_lookup.get(point.timestamp)
            if rate is None:
                continue
            converted.append(
                BasketSeriesPoint(
                    timestamp=point.timestamp,
                    value=point.value * rate,
                )
            )

        converted.sort(key=lambda entry: entry.timestamp)
        return BasketComposition(name="sp500-in-chf", points=converted)

    def compute_gold_in_usd(self) -> BasketComposition:
        """Return gold priced in USD per troy ounce."""

        points = [
            BasketSeriesPoint(timestamp=point.timestamp, value=point.value)
            for point in get_gold_series()
        ]
        return BasketComposition(name="gold-in-usd-per-troy-ounce", points=points)

    def compute_gold_in_usd_per_kg(self) -> BasketComposition:
        """Return gold priced in USD per kilogram."""

        points = [
            BasketSeriesPoint(
                timestamp=point.timestamp,
                value=point.value * TROY_OUNCES_PER_KILOGRAM,
            )
            for point in get_gold_series()
        ]
        return BasketComposition(name="gold-in-usd-per-kg", points=points)

    def compute_gold_in_usd_per_gram(self) -> BasketComposition:
        """Return gold priced in USD per gram."""

        points = [
            BasketSeriesPoint(
                timestamp=point.timestamp,
                value=point.value / GRAMS_PER_TROY_OUNCE,
            )
            for point in get_gold_series()
        ]
        return BasketComposition(name="gold-in-usd-per-gram", points=points)

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
