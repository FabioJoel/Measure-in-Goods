import { useEffect, useMemo, useState } from "react";

import AssetSelector from "./components/AssetSelector.jsx";
import BasketSelector from "./components/BasketSelector.jsx";
import ChartDisplay from "./components/ChartDisplay.jsx";

function normalizeSeries(meta, data) {
  const identifier = meta?.id ?? meta?.series_id ?? meta?.name ?? "series";
  const label = meta?.label ?? meta?.name ?? identifier;

  const rawPoints = Array.isArray(data) ? data : data?.points ?? [];

  const points = rawPoints
    .map((point) => {
      if (Array.isArray(point)) {
        const [timestamp, value] = point;
        return {
          timestamp,
          value: typeof value === "number" ? value : Number(value ?? NaN),
        };
      }

      const timestamp = point?.timestamp ?? point?.date ?? point?.time;
      const value = point?.value ?? point?.amount ?? point?.ratio;

      return {
        timestamp,
        value: typeof value === "number" ? value : Number(value ?? NaN),
      };
    })
    .filter(
      (point) =>
        Boolean(point.timestamp) && Number.isFinite(point.value ?? Number.NaN)
    );

  return {
    id: identifier,
    name: label,
    points,
  };
}

function App() {
  const [series, setSeries] = useState(null);
  const [seriesMeta, setSeriesMeta] = useState(null);
  const [status, setStatus] = useState({ state: "loading", message: "" });

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    []
  );

  const defaultQuery = useMemo(
    () => ({
      asset: "sp500",
      basket: "gold",
      start: "2023-01-01",
      end: "2023-12-31",
      freq: "monthly",
      rebase: "none",
      use: "ratio",
      interp: "none",
    }),
    []
  );

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(defaultQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value);
      }
    });

    return `${apiBaseUrl}/api/v1/series?${params.toString()}`;
  }, [apiBaseUrl, defaultQuery]);

  useEffect(() => {
    async function fetchSeries() {
      try {
        setStatus({ state: "loading", message: "Loading ratio…" });
        const response = await fetch(requestUrl);

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = await response.json();
        const nextMeta = payload?.meta ?? null;
        const normalized = normalizeSeries(nextMeta, payload?.data ?? []);

        setSeriesMeta(nextMeta);
        setSeries(normalized);
        setStatus({ state: "loaded", message: "" });
      } catch (error) {
        setStatus({
          state: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    fetchSeries();
  }, [requestUrl]);

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
        <section className="panel">
          <h2>Basket</h2>
          <BasketSelector />
        </section>
        <section className="panel full-width">
          <h2>Chart</h2>
          <ChartDisplay meta={seriesMeta} series={series} status={status} />
        </section>
      </main>
    </div>
  );
}

export default App;
