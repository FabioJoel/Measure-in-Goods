import { useEffect, useId, useMemo, useRef, useState } from "react";

const AVAILABLE_ASSETS = [
  { id: "SPX", label: "S&P 500 Index (SPX)" },
  { id: "SPY", label: "SPDR S&P 500 ETF (SPY)" },
  { id: "VT", label: "Vanguard Total World Stock ETF (VT)" },
  { id: "CSUSHPISA", label: "Case-Shiller US Home Price Index" },
  { id: "FHFA_HPI_USA", label: "FHFA US House Price Index" },
  { id: "EUROSTOXX50", label: "EURO STOXX 50 Index" },
  { id: "ATX", label: "Austrian Traded Index (ATX)" },
  { id: "BTCUSD", label: "Bitcoin / US Dollar" }
];

function highlightMatch(label, query) {
  if (!query) {
    return label;
  }

  const normalizedLabel = label.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const matchIndex = normalizedLabel.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return label;
  }

  const before = label.slice(0, matchIndex);
  const match = label.slice(matchIndex, matchIndex + query.length);
  const after = label.slice(matchIndex + query.length);

  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  );
}

function AssetSelector({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();

  const selectedAsset = useMemo(
    () => AVAILABLE_ASSETS.find((asset) => asset.id === value) ?? null,
    [value]
  );

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return AVAILABLE_ASSETS;
    }

    return AVAILABLE_ASSETS.filter((asset) =>
      asset.label.toLowerCase().includes(normalizedQuery) ||
      asset.id.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  const openListbox = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const closeListbox = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleSelect = (asset) => {
    onChange?.(asset.id);
    setQuery(asset.label);
    closeListbox();
    inputRef.current?.focus();
export const AVAILABLE_ASSETS = [
  { id: "CPIAUCSL", label: "US CPI - All Urban Consumers" },
  { id: "CPALTT01USM661S", label: "US Consumer Price Index" },
  { id: "WPIACO", label: "World Commodity Price Index" }
];

function AssetSelector({ selectedAssets = [], onSelectionChange = () => {} }) {
  const toggleAsset = (assetId) => {
    const nextSelection = selectedAssets.includes(assetId)
      ? selectedAssets.filter((id) => id !== assetId)
      : [...selectedAssets, assetId];

    onSelectionChange(nextSelection);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openListbox();
      setActiveIndex((current) => {
        const nextIndex = current + 1;
        if (nextIndex >= filteredAssets.length) {
          return filteredAssets.length > 0 ? 0 : -1;
        }
        return nextIndex;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openListbox();
      setActiveIndex((current) => {
        const prevIndex = current - 1;
        if (prevIndex < 0) {
          return filteredAssets.length > 0 ? filteredAssets.length - 1 : -1;
        }
        return prevIndex;
      });
    } else if (event.key === "Enter") {
      if (isOpen && activeIndex >= 0 && filteredAssets[activeIndex]) {
        event.preventDefault();
        handleSelect(filteredAssets[activeIndex]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setQuery("");
      onChange?.(null);
      closeListbox();
    }
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setQuery(newValue);
    openListbox();
    setActiveIndex(0);
  };

  const handleFocus = () => {
    openListbox();
    if (!query && selectedAsset) {
      setQuery(selectedAsset.label);
    }
  };

  const handleContainerBlur = (event) => {
    if (
      containerRef.current &&
      event.relatedTarget &&
      containerRef.current.contains(event.relatedTarget)
    ) {
      return;
    }

    if (!event.relatedTarget) {
      closeListbox();
      return;
    }

    closeListbox();
  };

  useEffect(() => {
    if (selectedAsset && !isOpen && query !== selectedAsset.label) {
      setQuery(selectedAsset.label);
    }

    if (!selectedAsset && !isOpen && query) {
      setQuery("");
    }
  }, [isOpen, query, selectedAsset]);

  useEffect(() => {
    if (filteredAssets.length === 0) {
      setActiveIndex(-1);
      return;
    }

    if (activeIndex >= filteredAssets.length) {
      setActiveIndex(filteredAssets.length - 1);
    }
  }, [activeIndex, filteredAssets]);

  const highlightedQuery = query.trim();

  return (
    <div
      className="asset-selector"
      ref={containerRef}
      onBlur={handleContainerBlur}
    >
      <label className="asset-selector__label" htmlFor={`${listboxId}-input`}>
        Search assets
      </label>
      <input
        id={`${listboxId}-input`}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={`${listboxId}-listbox`}
        aria-activedescendant={
          isOpen && activeIndex >= 0 && filteredAssets[activeIndex]
            ? `${listboxId}-option-${filteredAssets[activeIndex].id}`
            : undefined
        }
        placeholder="Choose an asset"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      />
      {isOpen && (
        <ul
          id={`${listboxId}-listbox`}
          role="listbox"
          className="asset-selector__listbox"
        >
          {filteredAssets.length === 0 ? (
            <li role="presentation" className="asset-selector__empty">
              {query
                ? `No assets found for “${query}”.`
                : "No assets available."}
            </li>
          ) : (
            filteredAssets.map((asset, index) => {
              const isActive = index === activeIndex;
              const isSelected = selectedAsset?.id === asset.id;

              return (
                <li
                  key={asset.id}
                  id={`${listboxId}-option-${asset.id}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`asset-selector__option${
                    isActive ? " asset-selector__option--active" : ""
                  }${isSelected ? " asset-selector__option--selected" : ""}`}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(asset)}
                >
                  <span className="asset-selector__option-label">
                    {highlightMatch(asset.label, highlightedQuery)}
                  </span>
                  <span className="asset-selector__option-id">
                    {highlightMatch(asset.id, highlightedQuery)}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    <div className="asset-selector">
      {AVAILABLE_ASSETS.map((asset) => (
        <label
          key={asset.id}
          className={selectedAssets.includes(asset.id) ? "selected" : ""}
        >
          <input
            type="checkbox"
            checked={selectedAssets.includes(asset.id)}
            onChange={() => toggleAsset(asset.id)}
          />
          <span>{asset.label}</span>
        </label>
      ))}
    </div>
  );
}

export default AssetSelector;
