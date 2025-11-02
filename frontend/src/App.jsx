import { useEffect, useMemo, useState } from "react";

import AssetSelector, {
  AVAILABLE_ASSETS,
} from "./components/AssetSelector.jsx";
import BasketSelector, {
  PRESET_BASKETS,
} from "./components/BasketSelector.jsx";
import ChartDisplay from "./components/ChartDisplay.jsx";

const REFERENCE_INDEXES = [
  {
    id: "sp500-gold",
    label: "S&P 500 priced in gold",
    endpoint: "/ratios/sp500-gold",
  },
];

function App() {
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

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    []
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
        const response = await fetch(`${apiBaseUrl}${option.endpoint}`);

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
  }, [apiBaseUrl, selectedIndex]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Measure in Goods</h1>
        <p>Prototype interface for constructing purchasing power baskets.</p>
      </header>
      <main className="app-grid">
        <section className="panel">
          <h2>Assets</h2>
          <AssetSelector
            selectedAsset={selectedAsset}
            onSelectionChange={setSelectedAsset}
          />
          <p className="panel-footnote">
            {selectedAsset
              ? `Tracking asset: ${
                  activeAssetOption?.label ?? selectedAsset
                }`
              : "Select an asset to include in your custom basket."}
          </p>
        </section>
        <section className="panel">
          <h2>Basket</h2>
          <BasketSelector
            activeBasket={activeBasket}
            onSelect={setActiveBasket}
          />
          <p className="panel-footnote">
            {activeBasket
              ? `Active basket template: ${activeBasket}`
              : "Choose a basket template to explore weighting approaches."}
          </p>
        </section>
        <section className="panel full-width">
          <h2>Reference index</h2>
          <ChartDisplay
            series={series}
            status={status}
            meta={{ name: activeIndexOption?.label ?? series?.name ?? "" }}
          />
          <div className="panel-subsection">
            <h3>Available ratios</h3>
            <BasketSelector
              options={REFERENCE_INDEXES.map(({ id, label }) => ({
                id,
                label,
              }))}
              activeBasket={selectedIndex}
              onSelect={setSelectedIndex}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
