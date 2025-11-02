export const PRESET_BASKETS = [
  { id: "everyday", label: "Everyday Essentials" },
  { id: "housing", label: "Housing & Utilities" },
  { id: "global", label: "Global Commodity Blend" }
];

function BasketSelector({ activeBasket, onSelect = () => {} }) {
  const resolvedActive =
    activeBasket ?? (PRESET_BASKETS.length > 0 ? PRESET_BASKETS[0].id : null);

  return (
    <div className="basket-selector">
      {PRESET_BASKETS.map((basket) => (
        <button
          key={basket.id}
          type="button"
          className={resolvedActive === basket.id ? "active" : ""}
          onClick={() => onSelect(basket.id)}
        >
          {basket.label}
        </button>
      ))}
    </div>
  );
}

export default BasketSelector;
