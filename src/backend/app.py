"""FastAPI application entry point for the Measure in Goods backend."""

from __future__ import annotations

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import pricing
from .models import BasketComputationRequest, BasketComposition, HealthResponse

app = FastAPI(title="Measure in Goods API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_pricing_engine() -> pricing.PricingEngine:
    """Dependency-injected pricing engine instance."""

    return pricing.PricingEngine()


@app.get("/health", response_model=HealthResponse)
def healthcheck() -> HealthResponse:
    """Lightweight endpoint for uptime monitoring."""

    return HealthResponse(status="ok")


@app.post("/basket/compute", response_model=BasketComposition)
def compute_basket(
    request: BasketComputationRequest,
    engine: pricing.PricingEngine = Depends(get_pricing_engine),
) -> BasketComposition:
    """Compute a goods basket based on asset selections and normalization rules."""

    return engine.compute(request)


@app.get("/ratios/sp500-gold", response_model=BasketComposition)
def sp500_in_gold(engine: pricing.PricingEngine = Depends(get_pricing_engine)) -> BasketComposition:
    """Return the S&P 500 priced in ounces of gold."""

    return engine.compute_sp500_in_gold()


@app.get("/ratios/sp500-usd", response_model=BasketComposition)
def sp500_in_usd(engine: pricing.PricingEngine = Depends(get_pricing_engine)) -> BasketComposition:
    """Return the S&P 500 priced in USD."""

    return engine.compute_sp500_in_usd()
