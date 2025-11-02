import { useEffect, useMemo, useState } from "react";

import AssetSelector, {
  AVAILABLE_ASSETS,
} from "./AssetSelector.jsx";
import BasketSelector, {
  PRESET_BASKETS,
} from "./BasketSelector.jsx";
import ChartDisplay from "./ChartDisplay.jsx";

const REFERENCE_INDEXES = [
  {
    id: "sp500-gold",
    label: "S&P 500 priced in gold",
    endpoint: "/ratios/sp500-gold",
  },
];

function ChartDemo({ apiBaseUrl }) {
  const [selectedAsset, setSelectedAsset] = useState(
    () => AVAILABLE_ASSETS[0]?.id ?? null
  );
  const [activeBasket, setActiveBasket] = useState(
    () => PRESET_BASKETS[0]?.id ?? null
  );
  const [selectedIndex, setSelectedIndex] = useState(REFERENCE_INDEXES[0].id);
  const [series, setSeries] = useState(null);
  const [status, setStatus] = useState({
    state: "loading",
    message: "Loading data…",
  });

  const baseUrl = useMemo(
    () => apiBaseUrl ?? import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    [apiBaseUrl]
  );

  const activeIndexOption = useMemo(
    () =>
      REFERENCE_INDEXES.find((option) => option.id === selectedIndex) ??
      REFERENCE_INDEXES[0],
    [selectedIndex]
  );

  const activeAssetOption = useMemo(
    () => AVAILABLE_ASSETS.find((option) => option.id === selectedAsset),
    [selectedAsset]
  );

  useEffect(() => {
    const option = REFERENCE_INDEXES.find((entry) => entry.id === selectedIndex);

    if (!option) {
      setSeries(null);
      setStatus({ state: "error", message: "Unknown reference index" });
      return undefined;
    }

    let cancelled = false;

    async function fetchSeries() {
      setStatus({
        state: "loading",
        message: `Loading ${option.label}…`,
      });

      try {
        const response = await fetch(`${baseUrl}${option.endpoint}`);

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
            error instanceof Error ? error.message : "Unable to load data",
        });
      }
    }

    fetchSeries();

    return () => {
      cancelled = true;
    };
  }, [baseUrl, selectedIndex]);

  return (
    <div className="chart-demo">
      <div className="chart-demo__intro">
        <h3>Land-tax inspired chart demo</h3>
        <p>
          Experiment with repricing equity benchmarks against reference assets.
          The controls are intentionally minimal – choose an asset, pick a basket
          template, and explore how ratios evolve.
        </p>
      </div>
      <div className="chart-demo__grid">
        <div className="chart-demo__panel">
          <h4>Choose an asset</h4>
          <AssetSelector
            selectedAsset={selectedAsset}
            onSelectionChange={setSelectedAsset}
          />
          <p className="chart-demo__footnote">
            {selectedAsset
              ? `Tracking asset: ${activeAssetOption?.label ?? selectedAsset}`
              : "Select an asset to include in your custom basket."}
          </p>
        </div>
        <div className="chart-demo__panel">
          <h4>Select a basket template</h4>
          <BasketSelector activeBasket={activeBasket} onSelect={setActiveBasket} />
          <p className="chart-demo__footnote">
            {activeBasket
              ? `Active basket template: ${activeBasket}`
              : "Choose a basket template to explore weighting approaches."}
          </p>
        </div>
      </div>
      <div className="chart-demo__reference">
        <div className="chart-demo__reference-header">
          <h4>Reference index</h4>
          <BasketSelector
            options={REFERENCE_INDEXES.map(({ id, label }) => ({ id, label }))}
            activeBasket={selectedIndex}
            onSelect={setSelectedIndex}
          />
        </div>
        <ChartDisplay
          series={series}
          status={status}
          meta={{ name: activeIndexOption?.label ?? series?.name ?? "" }}
        />
      </div>
    </div>
  );
}

export default ChartDemo;
