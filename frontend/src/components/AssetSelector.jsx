import { useState } from "react";

const AVAILABLE_ASSETS = [
  { id: "CPIAUCSL", label: "US CPI - All Urban Consumers" },
  { id: "CPALTT01USM661S", label: "US Consumer Price Index" },
  { id: "WPIACO", label: "World Commodity Price Index" }
];

function AssetSelector() {
  const [selected, setSelected] = useState([]);

  const toggleAsset = (assetId) => {
    setSelected((current) =>
      current.includes(assetId)
        ? current.filter((id) => id !== assetId)
        : [...current, assetId]
    );
  };

  return (
    <div className="asset-selector">
      {AVAILABLE_ASSETS.map((asset) => (
        <label key={asset.id} className={selected.includes(asset.id) ? "selected" : ""}>
          <input
            type="checkbox"
            checked={selected.includes(asset.id)}
            onChange={() => toggleAsset(asset.id)}
          />
          <span>{asset.label}</span>
        </label>
      ))}
    </div>
  );
}

export default AssetSelector;
