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


class UnitVariantCapability(BaseModel):
    """Specific variant of a unit (e.g. measurement choice) with its own endpoint."""

    id: Annotated[str, Field(description="Identifier for the unit variant, e.g. ounce")]
    label: Annotated[str, Field(description="Human-friendly name for the variant")]
    endpoint: Annotated[str, Field(description="API path returning the variant series")]
    chart_label: Annotated[str | None, Field(default=None, description="Optional override for chart titles")] = None


class UnitCapability(BaseModel):
    """Supported pricing unit for a given asset."""

    id: Annotated[str, Field(description="Identifier for the pricing unit, e.g. gold")]
    label: Annotated[str, Field(description="Human-friendly name for the unit")]
    endpoint: Annotated[str | None, Field(default=None, description="API path for the asset/unit series")] = None
    default_variant_id: Annotated[str | None, Field(default=None, description="Default variant identifier when multiple options exist")] = None
    variants: list[UnitVariantCapability] = Field(default_factory=list)


class AssetCapability(BaseModel):
    """Supported asset with its available pricing units."""

    id: Annotated[str, Field(description="Asset identifier, matching selector options")]
    label: Annotated[str, Field(description="Human-friendly asset label")]
    units: list[UnitCapability]


class CapabilityMatrix(BaseModel):
    """Overall capability map used by the frontend to drive selection options."""

    assets: list[AssetCapability]
