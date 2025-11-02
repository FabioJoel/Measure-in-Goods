import { useId, useMemo, useState } from "react";

export const AVAILABLE_ASSETS = [
  { id: "SPX", label: "S&P 500 Index (SPX)" },
  { id: "SPY", label: "SPDR S&P 500 ETF (SPY)" },
  { id: "VT", label: "Vanguard Total World Stock ETF (VT)" },
  { id: "CSUSHPISA", label: "Case-Shiller US Home Price Index" },
  { id: "FHFA_HPI_USA", label: "FHFA US House Price Index" },
  { id: "EUROSTOXX50", label: "EURO STOXX 50 Index" },
  { id: "ATX", label: "Austrian Traded Index (ATX)" },
  { id: "BTCUSD", label: "Bitcoin / US Dollar" },
  { id: "CPIAUCSL", label: "US CPI – All Urban Consumers" },
  { id: "CPALTT01USM661S", label: "US Consumer Price Index" },
  { id: "WPIACO", label: "World Commodity Price Index" },
];

function AssetSelector({ selectedAsset = null, onSelectionChange }) {
  const [query, setQuery] = useState("");
  const searchInputId = useId();
  const radioGroupName = useId();

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return AVAILABLE_ASSETS;
    }

    return AVAILABLE_ASSETS.filter(({ id, label }) => {
      const normalizedLabel = label.toLowerCase();
      const normalizedId = id.toLowerCase();

      return (
        normalizedLabel.includes(normalizedQuery) ||
        normalizedId.includes(normalizedQuery)
      );
    });
  }, [query]);

  const handleSelection = (assetId) => {
    onSelectionChange?.(assetId);
  };

  return (
    <div className="asset-selector" role="group" aria-label="Available assets">
      <label className="asset-selector__search-label" htmlFor={searchInputId}>
        Search by name or ticker
      </label>
      <input
        id={searchInputId}
        type="search"
        className="asset-selector__search-input"
        placeholder="Start typing to filter assets"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />
      <ul
        className="asset-selector__list"
        role="radiogroup"
        aria-label="Available asset options"
      >
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => {
            const isSelected = selectedAsset === asset.id;

            return (
              <li key={asset.id} className="asset-selector__item">
                <label
                  className={`asset-selector__option${isSelected ? " selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={radioGroupName}
                    value={asset.id}
                    checked={isSelected}
                    onChange={() => handleSelection(asset.id)}
                  />
                  <span className="asset-selector__label">{asset.label}</span>
                  <span className="asset-selector__id">{asset.id}</span>
                </label>
              </li>
            );
          })
        ) : (
          <li className="asset-selector__empty">No assets match your search.</li>
        )}
      </ul>
    </div>
  );
}

export default AssetSelector;
