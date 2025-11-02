import { useEffect, useMemo, useState } from "react";

import AssetSelector, {
  AVAILABLE_ASSETS,
} from "./components/AssetSelector.jsx";
import BasketSelector, {
  PRESET_BASKETS,
} from "./components/BasketSelector.jsx";
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
  const [initialUrlState] = useState(() => {
    if (typeof window === "undefined") {
      return {
        assets: [],
        basket: null,
        dateParams: {},
        mode: "search",
        originalHash: "",
      };
    }

    const search = window.location.search.slice(1);
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const mode = search ? "search" : hash ? "hash" : "search";
    const source = mode === "hash" ? hash : search;
    const params = new URLSearchParams(source);

    const assetValues = params.getAll("asset");
    const assets = assetValues
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);

    const basket = params.get("basket");
    const dateParams = {
      start: params.get("start") ?? "",
      end: params.get("end") ?? "",
      date: params.get("date") ?? "",
    };

    return {
      assets,
      basket,
      dateParams,
      mode,
      originalHash: mode === "hash" ? "" : window.location.hash,
    };
  });

  const availableAssetIds = useMemo(
    () => new Set(AVAILABLE_ASSETS.map((asset) => asset.id)),
    []
  );

  const [selectedAssets, setSelectedAssets] = useState(() =>
    initialUrlState.assets.filter((id) => availableAssetIds.has(id))
  );
  const [activeBasket, setActiveBasket] = useState(() => {
    const fallback = PRESET_BASKETS[0]?.id ?? null;

    if (!initialUrlState.basket) {
      return fallback;
    }

    return PRESET_BASKETS.some((basket) => basket.id === initialUrlState.basket)
      ? initialUrlState.basket
      : fallback;
  });
  const [series, setSeries] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("selectedAssetId");
  });
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

  const { mode: urlMode, originalHash, dateParams } = initialUrlState;
  const initialStart = dateParams.start;
  const initialEnd = dateParams.end;
  const initialDate = dateParams.date;

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
    const params = new URLSearchParams();

    selectedAssets.forEach((asset) => params.append("asset", asset));

    if (activeBasket) {
      params.set("basket", activeBasket);
    }

    if (initialStart) {
      params.set("start", initialStart);
    }

    if (initialEnd) {
      params.set("end", initialEnd);
    }

    if (initialDate) {
      params.set("date", initialDate);
    }

    const queryString = params.toString();

    if (urlMode === "hash") {
      const newUrl = `${window.location.pathname}${
        queryString ? `#${queryString}` : ""
      }`;
      window.history.replaceState(null, "", newUrl);
      return;
    }

    const newUrl = `${window.location.pathname}${
      queryString ? `?${queryString}` : ""
    }${originalHash ?? ""}`;

    window.history.replaceState(null, "", newUrl);
  }, [
    selectedAssets,
    activeBasket,
    urlMode,
    originalHash,
    initialStart,
    initialEnd,
    initialDate,
  ]);

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
          <AssetSelector
            selectedAssets={selectedAssets}
            onSelectionChange={setSelectedAssets}
          />
        </section>
        <section className="panel">
          <h2>Basket</h2>
          <BasketSelector
            activeBasket={activeBasket}
            onSelect={setActiveBasket}
          />
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
