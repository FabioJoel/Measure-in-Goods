"""Pydantic models for basket computation requests and responses."""

from __future__ import annotations

from datetime import date
from typing import Annotated

from pydantic import BaseModel, Field, PositiveFloat


class HealthResponse(BaseModel):
    """Schema for the healthcheck endpoint."""

    status: str = Field(description="Service status message")


class AssetSelection(BaseModel):
    """Incoming asset selection configuration."""

    source: Annotated[str, Field(description="Identifier for the data source, e.g. FRED")]
    series_id: Annotated[str, Field(description="Series identifier within the data source")]
    weight: PositiveFloat


class BasketComputationRequest(BaseModel):
    """Request payload accepted by the basket computation endpoint."""

    assets: list[AssetSelection]
    base_currency: Annotated[str, Field(description="ISO code of the currency for comparison")]
    start_date: date | None = Field(default=None, description="Optional start date filter")
    end_date: date | None = Field(default=None, description="Optional end date filter")


class BasketSeriesPoint(BaseModel):
    """Normalized time series point for basket output."""

    timestamp: date
    value: float


class BasketComposition(BaseModel):
    """Response payload returning the computed basket series."""

    name: str
    points: list[BasketSeriesPoint]
