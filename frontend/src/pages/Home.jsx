import { useEffect, useMemo, useState } from "react";

import AssetSelector, {
  AVAILABLE_ASSETS,
} from "../components/AssetSelector.jsx";
import ChartDisplay from "../components/ChartDisplay.jsx";
import CustomBasketBuilder from "../components/CustomBasketBuilder.jsx";
import SearchSelect from "../components/SearchSelect.jsx";

const PRICING_UNITS = [
  { id: "gold", label: "Gold" },
  { id: "usd", label: "USD" },
  { id: "chf", label: "Swiss franc (CHF)" },
  { id: "silver", label: "Silver" },
  { id: "housing", label: "Housing basket" },
  { id: "energy", label: "Energy basket" },
  { id: "custom", label: "Custom basket" },
];

const SERIES_ENDPOINTS = {
  "SPX::gold": "/ratios/sp500-gold",
  "SPY::gold": "/ratios/sp500-gold",
  "SPX::usd": "/ratios/sp500-usd",
  "SPY::usd": "/ratios/sp500-usd",
  "SPX::chf": "/ratios/sp500-chf",
  "SPY::chf": "/ratios/sp500-chf",
  "GOLD::usd": "/ratios/gold-usd",
};

const TROY_OUNCES_PER_KILOGRAM = 32.1507466;
const GRAMS_PER_TROY_OUNCE = 31.1034768;

const GOLD_VARIANTS = [
  { id: "ounce", label: "Spot price (USD/oz troy)" },
  { id: "kilogram", label: "Price per kilogram (USD/kg)" },
  { id: "gram", label: "Price per gram (USD/g)" },
];

const UNIT_VARIANTS = {
  gold: {
    default: "ounce",
    options: [
      {
        id: "ounce",
        label: "Troy ounce",
        transform: (value) => value,
      },
      {
        id: "kilogram",
        label: "Kilogram",
        transform: (value) => value / TROY_OUNCES_PER_KILOGRAM,
      },
      {
        id: "gram",
        label: "Gram",
        transform: (value) => value * GRAMS_PER_TROY_OUNCE,
      },
    ],
  },
};

function applyUnitVariantToSeries(series, unitId, variantId) {
  if (!series) {
    return series;
  }

  const config = UNIT_VARIANTS[unitId];
  if (!config) {
    return series;
  }

  const targetId = variantId ?? config.default;
  const variant =
    config.options.find((option) => option.id === targetId) ??
    config.options.find((option) => option.id === config.default);

  if (!variant?.transform || !Array.isArray(series.points)) {
    return variant ? { ...series } : series;
  }

  return {
    ...series,
    points: series.points.map((point) => ({
      ...point,
      value: variant.transform(point.value),
    })),
  };
}

const BASKET_RESOURCES = [
  { id: "gold", label: "Gold bullion", category: "Metals" },
  { id: "silver", label: "Silver bullion", category: "Metals" },
  { id: "timber", label: "Timber (per cubic metre)", category: "Materials" },
  { id: "oil", label: "Crude oil (barrel)", category: "Energy" },
  { id: "natgas", label: "Natural gas (MMBtu)", category: "Energy" },
  { id: "plastics", label: "Industrial plastics", category: "Materials" },
  { id: "wheat", label: "Wheat (bushel)", category: "Agriculture" },
  { id: "rice", label: "Rice (cwt)", category: "Agriculture" },
];

export default function HomePage() {
  const [selectedAsset, setSelectedAsset] = useState(
    () => AVAILABLE_ASSETS[0]?.id ?? null
  );
  const [selectedUnit, setSelectedUnit] = useState(PRICING_UNITS[0].id);
  const [customBasketItems, setCustomBasketItems] = useState([]);
  const [rawSeries, setRawSeries] = useState(null);
  const [series, setSeries] = useState(null);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [selectedGoldVariant, setSelectedGoldVariant] = useState(
    GOLD_VARIANTS[0].id
  );
  const [selectedUnitVariant, setSelectedUnitVariant] = useState(
    UNIT_VARIANTS[PRICING_UNITS[0].id]?.default ?? null
  );

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    []
  );

  const activeAsset = useMemo(
    () => AVAILABLE_ASSETS.find((option) => option.id === selectedAsset) ?? null,
    [selectedAsset]
  );

  const activeUnit = useMemo(
    () => PRICING_UNITS.find((option) => option.id === selectedUnit) ?? null,
    [selectedUnit]
  );

  const activeGoldVariant = useMemo(
    () => GOLD_VARIANTS.find((option) => option.id === selectedGoldVariant) ?? null,
    [selectedGoldVariant]
  );

  const activeUnitVariant = useMemo(() => {
    const config = UNIT_VARIANTS[selectedUnit];
    if (!config) {
      return null;
    }
    const targetId = selectedUnitVariant ?? config.default;
    return (
      config.options.find((option) => option.id === targetId) ??
      config.options.find((option) => option.id === config.default) ??
      null
    );
  }, [selectedUnit, selectedUnitVariant]);

  useEffect(() => {
    const config = UNIT_VARIANTS[selectedUnit];
    if (!config) {
      setSelectedUnitVariant(null);
      return;
    }
    setSelectedUnitVariant((current) => {
      if (!current) {
        return config.default;
      }
      return config.options.some((option) => option.id === current)
        ? current
        : config.default;
    });
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedUnit === "custom") {
      setRawSeries(null);
      setSeries(null);
      setStatus({
        state: "idle",
        message:
          customBasketItems.length === 0
            ? "Build a custom basket to preview calculations."
            : "Custom basket ready – hook up pricing data next.",
      });
      return;
    }

    if (!selectedAsset || !selectedUnit) {
      setRawSeries(null);
      setSeries(null);
      setStatus({ state: "idle", message: "Choose an asset to begin." });
      return;
    }

    const assetLabel = activeAsset?.label ?? selectedAsset ?? "asset";
    const unitLabel =
      selectedAsset === "GOLD" && selectedUnit === "usd"
        ? activeGoldVariant?.label ?? "USD"
        : activeUnit?.label ?? "basket";
    let cancelled = false;

    const unsupportedMessage = `Pricing ${assetLabel} in ${unitLabel} is not available yet.`;

    async function fetchApiSeries(endpoint) {
      setStatus({
        state: "loading",
        message: `Loading ${assetLabel} priced in ${unitLabel}…`,
      });

      try {
        const response = await fetch(`${apiBaseUrl}${endpoint}`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (cancelled) {
          return;
        }

        setRawSeries(payload);
        setSeries(
          applyUnitVariantToSeries(
            payload,
            selectedUnit,
            selectedUnitVariant
          )
        );
        setStatus({ state: "loaded", message: "" });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setRawSeries(null);
        setSeries(null);
        setStatus({
          state: "error",
          message:
            error instanceof Error ? error.message : "Unable to load data.",
        });
      }
    }

    let endpoint = SERIES_ENDPOINTS[`${selectedAsset}::${selectedUnit}`];

    if (selectedAsset === "GOLD") {
      if (selectedUnit !== "usd") {
        endpoint = null;
      } else {
        endpoint = {
          kilogram: "/ratios/gold-usd-kg",
          gram: "/ratios/gold-usd-gram",
          ounce: "/ratios/gold-usd",
        }[selectedGoldVariant] ?? "/ratios/gold-usd";
      }
    }

    if (!endpoint) {
      setRawSeries(null);
      setSeries(null);
      setStatus({
        state: "error",
        message: unsupportedMessage,
      });
      return;
    }

    fetchApiSeries(endpoint);

    return () => {
      cancelled = true;
    };
  }, [
    apiBaseUrl,
    activeUnit?.label,
    activeGoldVariant?.label,
    customBasketItems.length,
    selectedAsset,
    selectedUnit,
    selectedGoldVariant,
  ]);

  useEffect(() => {
    if (!rawSeries) {
      setSeries(null);
      return;
    }

    setSeries(
      applyUnitVariantToSeries(rawSeries, selectedUnit, selectedUnitVariant)
    );
  }, [rawSeries, selectedUnit, selectedUnitVariant]);

  const chartTitle = useMemo(() => {
    if (!activeAsset || !activeUnit) {
      return "Asset priced in goods";
    }

    if (selectedUnit === "custom") {
      return `${activeAsset.label} priced in your custom basket`;
    }

    if (activeAsset.id === "GOLD" && selectedUnit === "usd") {
      return `${activeAsset.label} priced in ${activeGoldVariant?.label ?? activeUnit.label}`;
    }

    const unitDescriptor = activeUnitVariant
      ? `${activeUnit.label} (${activeUnitVariant.label})`
      : activeUnit.label;

    return `${activeAsset.label} priced in ${unitDescriptor}`;
  }, [activeAsset, activeGoldVariant?.label, activeUnit, activeUnitVariant, selectedUnit]);

  return (
    <section className="site-wrap chart-section">
      <div className="chart-shell">
        <ChartDisplay
          series={series}
          status={status}
          meta={{ name: chartTitle }}
        />
        <p className="data-attribution">
          <span className="data-attribution__label" tabIndex={0} role="button">
            Source
          </span>
          <span className="data-attribution__tooltip">
            FRED, Federal Reserve Bank of St. Louis. This product uses the FRED® API but is not
            endorsed or certified by the Federal Reserve Bank of St. Louis. {" "}
            <a
              href="https://fred.stlouisfed.org/docs/api/terms_of_use.html"
              target="_blank"
              rel="noreferrer"
            >
              FRED® API Terms of Use
            </a>
            .
          </span>
        </p>
      </div>
      <div className="selector-row">
        <AssetSelector
          selectedAsset={selectedAsset}
          onSelectionChange={setSelectedAsset}
        />
        <span className="selector-row__separator">priced in</span>
        <SearchSelect
          options={PRICING_UNITS}
          value={selectedUnit}
          onChange={setSelectedUnit}
          placeholder="Search units"
          className="search-select--unit"
          allowEmpty
        />
      </div>

      {selectedAsset === "GOLD" && selectedUnit === "usd" ? (
        <div className="variant-picker">
          <span className="variant-picker__label">Gold metric</span>
          <div
            className="range-toggle"
            role="group"
            aria-label="Select gold measurement"
          >
            {GOLD_VARIANTS.map((variant) => (
              <button
                key={variant.id}
                type="button"
                className={`range-toggle__button${
                  selectedGoldVariant === variant.id ? " is-active" : ""
                }`}
                onClick={() => setSelectedGoldVariant(variant.id)}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {UNIT_VARIANTS[selectedUnit] ? (
        <div className="variant-picker">
          <span className="variant-picker__label">
            {`${activeUnit?.label ?? "Unit"} measurement`}
          </span>
          <div
            className="range-toggle"
            role="group"
            aria-label={`Select ${activeUnit?.label ?? "unit"} measurement`}
          >
            {UNIT_VARIANTS[selectedUnit].options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`range-toggle__button${
                  selectedUnitVariant === option.id ? " is-active" : ""
                }`}
                onClick={() => setSelectedUnitVariant(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selectedUnit === "custom" ? (
        <div className="builder-shell">
          <CustomBasketBuilder
            resources={BASKET_RESOURCES}
            items={customBasketItems}
            onItemsChange={setCustomBasketItems}
          />
        </div>
      ) : null}
    </section>
  );
}
