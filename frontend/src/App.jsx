import { useEffect, useMemo, useState } from "react";

import AssetSelector from "./components/AssetSelector.jsx";
import BasketSelector from "./components/BasketSelector.jsx";
import ChartDisplay from "./components/ChartDisplay.jsx";

const INDEX_OPTIONS = [
  { id: "balanced_v1", label: "Balanced v1" },
  { id: "energy_heavy_v1", label: "Energy Heavy v1" },
  { id: "metals_only_v1", label: "Metals Only v1" },
  { id: "cpi_us_passthrough", label: "CPI (US) passthrough" },
  { id: "hicp_ea_passthrough", label: "HICP (EA) passthrough" }
];

const getInitialIndex = () => {
  const fallback = INDEX_OPTIONS[0].id;
  if (typeof window === "undefined") {
    return fallback;
  }

  const params = new URLSearchParams(window.location.search);
  const requested = params.get("index");
  return INDEX_OPTIONS.some((option) => option.id === requested)
    ? requested
    : fallback;
};

function App() {
  const [series, setSeries] = useState(null);
  const [status, setStatus] = useState({ state: "loading", message: "" });
  const [selectedIndex, setSelectedIndex] = useState(getInitialIndex);

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    []
  );

  const selectedOption = useMemo(
    () =>
      INDEX_OPTIONS.find((option) => option.id === selectedIndex) ??
      INDEX_OPTIONS[0],
    [selectedIndex]
  );

  const selectionLabel = selectedOption.label;

  useEffect(() => {
    let cancelled = false;

    async function fetchSeries() {
      try {
        setStatus({
          state: "loading",
          message: `Loading ${selectionLabel} basket…`
        });
        const response = await fetch(`${apiBaseUrl}/ratios/${selectedIndex}`);

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
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

        setStatus({
          state: "error",
          message:
            error instanceof Error ? error.message : "Unable to load basket"
        });
      }
    }

    fetchSeries();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, selectedIndex, selectionLabel]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.set("index", selectedIndex);
    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${
      queryString ? `?${queryString}` : ""
    }`;
    window.history.replaceState({}, "", nextUrl);
  }, [selectedIndex]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Measure in Goods</h1>
        <p>Prototype interface for constructing purchasing power baskets.</p>
      </header>
      <main className="app-grid">
        <section className="panel">
          <h2>Assets</h2>
          <AssetSelector />
        </section>
        <section className="panel full-width">
          <h2>Chart</h2>
          <ChartDisplay
            series={series}
            status={status}
            selectionLabel={selectionLabel}
          />
          <div className="panel-subsection">
            <h3>Reference baskets</h3>
            <BasketSelector
              options={INDEX_OPTIONS}
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
