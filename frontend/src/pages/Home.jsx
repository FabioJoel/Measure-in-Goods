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
};

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
  const [series, setSeries] = useState(null);
  const [status, setStatus] = useState({ state: "idle", message: "" });

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

  useEffect(() => {
    if (selectedUnit === "custom") {
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
      setSeries(null);
      setStatus({ state: "idle", message: "Choose an asset to begin." });
      return;
    }

    const unitLabel = activeUnit?.label ?? "basket";
    let cancelled = false;

    const unsupportedMessage = `Pricing ${selectedAsset} in ${unitLabel} is not available yet.`;

    async function fetchApiSeries(endpoint) {
      setStatus({
        state: "loading",
        message: `Loading ${selectedAsset} priced in ${unitLabel}…`,
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

        setSeries(payload);
        setStatus({ state: "loaded", message: "" });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setSeries(null);
        setStatus({
          state: "error",
          message:
            error instanceof Error ? error.message : "Unable to load data.",
        });
      }
    }

    const endpoint = SERIES_ENDPOINTS[`${selectedAsset}::${selectedUnit}`];
    if (!endpoint) {
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
    customBasketItems.length,
    selectedAsset,
    selectedUnit,
  ]);

  const chartTitle =
    activeAsset && activeUnit
      ? selectedUnit === "custom"
        ? `${activeAsset.label} priced in your custom basket`
        : `${activeAsset.label} priced in ${activeUnit.label}`
      : "Asset priced in goods";

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
