import { useEffect, useMemo, useState } from "react";

import AssetSelector from "../components/AssetSelector.jsx";
import ChartDisplay from "../components/ChartDisplay.jsx";
import CustomBasketBuilder from "../components/CustomBasketBuilder.jsx";
import SearchSelect from "../components/SearchSelect.jsx";

const CUSTOM_UNIT_OPTION = { id: "custom", label: "Custom basket" };

const FALLBACK_CAPABILITIES = {
  assets: [
    {
      id: "SPX",
      label: "S&P 500 Index (SPX)",
      units: [
        { id: "gold", label: "Gold", endpoint: "/ratios/sp500-gold" },
        { id: "usd", label: "USD", endpoint: "/ratios/sp500-usd" },
        { id: "chf", label: "Swiss franc (CHF)", endpoint: "/ratios/sp500-chf" },
      ],
    },
    {
      id: "SPY",
      label: "SPDR S&P 500 ETF (SPY)",
      units: [
        { id: "gold", label: "Gold", endpoint: "/ratios/sp500-gold" },
        { id: "usd", label: "USD", endpoint: "/ratios/sp500-usd" },
        { id: "chf", label: "Swiss franc (CHF)", endpoint: "/ratios/sp500-chf" },
      ],
    },
    {
      id: "GOLD",
      label: "Gold",
      units: [
        {
          id: "usd",
          label: "USD",
          default_variant_id: "ounce",
          variants: [
            {
              id: "ounce",
              label: "Troy ounce",
              chart_label: "USD per troy ounce",
              endpoint: "/ratios/gold-usd",
            },
            {
              id: "kilogram",
              label: "Kilogram",
              chart_label: "USD per kilogram",
              endpoint: "/ratios/gold-usd-kg",
            },
            {
              id: "gram",
              label: "Gram",
              chart_label: "USD per gram",
              endpoint: "/ratios/gold-usd-gram",
            },
          ],
        },
      ],
    },
  ],
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
  const [capabilityState, setCapabilityState] = useState({
    status: "loading",
    data: FALLBACK_CAPABILITIES,
    error: "",
  });
  const [selectedAsset, setSelectedAsset] = useState(
    FALLBACK_CAPABILITIES.assets[0]?.id ?? null
  );
  const [selectedUnit, setSelectedUnit] = useState(
    FALLBACK_CAPABILITIES.assets[0]?.units?.[0]?.id ?? CUSTOM_UNIT_OPTION.id
  );
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [series, setSeries] = useState(null);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [customBasketItems, setCustomBasketItems] = useState([]);

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCapabilities() {
      setCapabilityState((current) => ({
        status: "loading",
        data: current.data,
        error: "",
      }));

      try {
        const response = await fetch(`${apiBaseUrl}/metadata/capabilities`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Capabilities request failed with ${response.status}`);
        }
        const payload = await response.json();
        if (cancelled) {
          return;
        }
        setCapabilityState({ status: "loaded", data: payload, error: "" });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setCapabilityState({
          status: "error",
          data: FALLBACK_CAPABILITIES,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load capability matrix.",
        });
      }
    }

    loadCapabilities();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  const capabilities = capabilityState.data;

  const assetOptions = useMemo(
    () =>
      (capabilities?.assets ?? []).map(({ id, label }) => ({
        id,
        label,
      })),
    [capabilities]
  );

  useEffect(() => {
    if (!assetOptions.length) {
      setSelectedAsset(null);
      return;
    }
    setSelectedAsset((current) => {
      if (current && assetOptions.some((option) => option.id === current)) {
        return current;
      }
      return assetOptions[0].id;
    });
  }, [assetOptions]);

  const activeAsset = useMemo(
    () => assetOptions.find((option) => option.id === selectedAsset) ?? null,
    [assetOptions, selectedAsset]
  );

  const assetCapability = useMemo(() => {
    if (!capabilities) {
      return null;
    }
    return (
      capabilities.assets.find((asset) => asset.id === selectedAsset) ?? null
    );
  }, [capabilities, selectedAsset]);

  const unitOptions = useMemo(
    () =>
      (assetCapability?.units ?? []).map(({ id, label }) => ({
        id,
        label,
      })),
    [assetCapability]
  );

  const unitSelectOptions = useMemo(() => {
    if (!unitOptions.length) {
      return [CUSTOM_UNIT_OPTION];
    }
    return [...unitOptions, CUSTOM_UNIT_OPTION];
  }, [unitOptions]);

  useEffect(() => {
    if (!unitOptions.length) {
      setSelectedUnit(CUSTOM_UNIT_OPTION.id);
      return;
    }
    setSelectedUnit((current) => {
      if (current === CUSTOM_UNIT_OPTION.id) {
        return current;
      }
      return unitOptions.some((option) => option.id === current)
        ? current
        : unitOptions[0].id;
    });
  }, [unitOptions]);

  useEffect(() => {
    if (selectedUnit === null && unitOptions.length) {
      setSelectedUnit(unitOptions[0].id);
    } else if (selectedUnit === null && !unitOptions.length) {
      setSelectedUnit(CUSTOM_UNIT_OPTION.id);
    }
  }, [selectedUnit, unitOptions]);

  const activeUnit = useMemo(
    () =>
      unitSelectOptions.find((option) => option.id === selectedUnit) ?? null,
    [unitSelectOptions, selectedUnit]
  );

  const unitCapability = useMemo(() => {
    if (!assetCapability || !selectedUnit || selectedUnit === CUSTOM_UNIT_OPTION.id) {
      return null;
    }
    return (
      assetCapability.units.find((unit) => unit.id === selectedUnit) ?? null
    );
  }, [assetCapability, selectedUnit]);

  const variantOptions = useMemo(
    () => unitCapability?.variants ?? [],
    [unitCapability]
  );

  useEffect(() => {
    if (!unitCapability?.variants?.length) {
      setSelectedVariant(null);
      return;
    }

    setSelectedVariant((current) => {
      if (
        current &&
        unitCapability.variants.some((variant) => variant.id === current)
      ) {
        return current;
      }
      return (
        unitCapability.default_variant_id ??
        unitCapability.variants[0]?.id ??
        null
      );
    });
  }, [unitCapability]);

  const activeVariant = useMemo(() => {
    if (!variantOptions.length) {
      return null;
    }

    if (selectedVariant) {
      const match = variantOptions.find(
        (variant) => variant.id === selectedVariant
      );
      if (match) {
        return match;
      }
    }

    if (unitCapability?.default_variant_id) {
      const fallback = variantOptions.find(
        (variant) => variant.id === unitCapability.default_variant_id
      );
      if (fallback) {
        return fallback;
      }
    }

    return variantOptions[0] ?? null;
  }, [selectedVariant, unitCapability?.default_variant_id, variantOptions]);

  const unitStatusLabel = useMemo(() => {
    if (selectedUnit === CUSTOM_UNIT_OPTION.id) {
      return activeUnit?.label ?? "custom basket";
    }
    if (activeVariant?.label && activeUnit?.label) {
      return `${activeUnit.label} (${activeVariant.label})`;
    }
    return activeUnit?.label ?? selectedUnit ?? "unit";
  }, [activeUnit, activeVariant?.label, selectedUnit]);

  const unitDescriptor = useMemo(() => {
    if (selectedUnit === CUSTOM_UNIT_OPTION.id) {
      return activeUnit?.label ?? "Custom basket";
    }
    if (activeVariant?.chart_label) {
      return activeVariant.chart_label;
    }
    if (activeVariant?.label && activeUnit?.label) {
      return `${activeUnit.label} (${activeVariant.label})`;
    }
    return activeUnit?.label ?? selectedUnit ?? "unit";
  }, [activeUnit, activeVariant, selectedUnit]);

  const resolvedEndpoint = useMemo(() => {
    if (!unitCapability || selectedUnit === CUSTOM_UNIT_OPTION.id) {
      return null;
    }
    if (variantOptions.length) {
      const preferred =
        variantOptions.find((variant) => variant.id === selectedVariant) ??
        variantOptions.find(
          (variant) => variant.id === unitCapability.default_variant_id
        ) ??
        variantOptions[0];
      return preferred?.endpoint ?? null;
    }
    return unitCapability.endpoint ?? null;
  }, [selectedUnit, selectedVariant, unitCapability, variantOptions]);

  useEffect(() => {
    if (selectedUnit === CUSTOM_UNIT_OPTION.id) {
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

    if (!resolvedEndpoint) {
      const assetLabel = activeAsset?.label ?? selectedAsset ?? "asset";
      setSeries(null);
      setStatus({
        state: "error",
        message: `Pricing ${assetLabel} in ${unitStatusLabel} is not available yet.`,
      });
      return;
    }

    let cancelled = false;
    const assetLabel = activeAsset?.label ?? selectedAsset ?? "asset";

    async function fetchSeries() {
      setStatus({
        state: "loading",
        message: `Loading ${assetLabel} priced in ${unitStatusLabel}…`,
      });

      try {
        const response = await fetch(`${apiBaseUrl}${resolvedEndpoint}`);
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

    fetchSeries();

    return () => {
      cancelled = true;
    };
  }, [
    apiBaseUrl,
    activeAsset?.label,
    customBasketItems.length,
    resolvedEndpoint,
    selectedAsset,
    selectedUnit,
    unitStatusLabel,
  ]);

  const chartTitle = useMemo(() => {
    if (!activeAsset || !activeUnit) {
      return "Asset priced in goods";
    }

    if (selectedUnit === CUSTOM_UNIT_OPTION.id) {
      return `${activeAsset.label} priced in your custom basket`;
    }

    return `${activeAsset.label} priced in ${unitDescriptor}`;
  }, [activeAsset, activeUnit, selectedUnit, unitDescriptor]);

  const capabilityWarning =
    capabilityState.status === "error" && capabilityState.error
      ? `Capabilities unavailable (${capabilityState.error}). Showing fallback options.`
      : null;

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
            endorsed or certified by the Federal Reserve Bank of St. Louis.{" "}
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
          options={assetOptions}
          selectedAsset={selectedAsset}
          onSelectionChange={setSelectedAsset}
        />
        <span className="selector-row__separator">priced in</span>
        <SearchSelect
          options={unitSelectOptions}
          value={selectedUnit}
          onChange={setSelectedUnit}
          placeholder="Search units"
          className="search-select--unit"
          allowEmpty
        />
      </div>
      {capabilityWarning ? (
        <p className="selector-row__notice">{capabilityWarning}</p>
      ) : null}

      {variantOptions.length ? (
        <div className="variant-picker">
          <span className="variant-picker__label">
            {`${activeUnit?.label ?? "Unit"} measurement`}
          </span>
          <div
            className="range-toggle"
            role="group"
            aria-label={`Select ${activeUnit?.label ?? "unit"} measurement`}
          >
            {variantOptions.map((variant) => (
              <button
                key={variant.id}
                type="button"
                className={`range-toggle__button${
                  (activeVariant?.id ?? null) === variant.id ? " is-active" : ""
                }`}
                onClick={() => setSelectedVariant(variant.id)}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selectedUnit === CUSTOM_UNIT_OPTION.id ? (
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
