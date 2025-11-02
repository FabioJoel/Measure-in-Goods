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

  return (
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
