import SearchSelect from "./SearchSelect.jsx";

export const AVAILABLE_ASSETS = [
  { id: "SPX", label: "S&P 500 Index (SPX)" },
  { id: "SPY", label: "SPDR S&P 500 ETF (SPY)" },
  { id: "XAUUSD", label: "Gold spot price (XAUUSD)" },
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
  return (
    <SearchSelect
      options={AVAILABLE_ASSETS}
      value={selectedAsset}
      onChange={onSelectionChange}
      placeholder="Search assets"
      className="search-select--asset"
      showOptionId
    />
  );
}

export default AssetSelector;
