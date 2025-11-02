import { useEffect, useMemo, useState } from "react";

import AssetSelector from "./components/AssetSelector.jsx";
import BasketSelector from "./components/BasketSelector.jsx";
import ChartDisplay from "./components/ChartDisplay.jsx";

function App() {
  const [series, setSeries] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("selectedAssetId");
  });
  const [status, setStatus] = useState({ state: "loading", message: "" });

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    []
  );

  useEffect(() => {
    async function fetchSeries() {
      try {
        setStatus({ state: "loading", message: "Loading ratio…" });
        const response = await fetch(`${apiBaseUrl}/ratios/sp500-gold`);

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = await response.json();
        setSeries(payload);
        setStatus({ state: "loaded", message: "" });
      } catch (error) {
        setStatus({
          state: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    fetchSeries();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (selectedAssetId) {
      window.localStorage.setItem("selectedAssetId", selectedAssetId);
    } else {
      window.localStorage.removeItem("selectedAssetId");
    }
  }, [selectedAssetId]);

  const handleAssetChange = (assetId) => {
    setSelectedAssetId(assetId);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Measure in Goods</h1>
        <p>Prototype interface for constructing purchasing power baskets.</p>
      </header>
      <main className="app-grid">
        <section className="panel">
          <h2>Assets</h2>
          <AssetSelector value={selectedAssetId} onChange={handleAssetChange} />
        </section>
        <section className="panel">
          <h2>Basket</h2>
          <BasketSelector />
        </section>
        <section className="panel full-width">
          <h2>Chart</h2>
          <ChartDisplay series={series} status={status} />
        </section>
      </main>
    </div>
  );
}

export default App;
