import { useState } from "react";

const PRESET_BASKETS = [
  { id: "everyday", label: "Everyday Essentials" },
  { id: "housing", label: "Housing & Utilities" },
  { id: "global", label: "Global Commodity Blend" }
];

function BasketSelector() {
  const [activeBasket, setActiveBasket] = useState(PRESET_BASKETS[0].id);

  return (
    <div className="basket-selector">
      {PRESET_BASKETS.map((basket) => (
        <button
          key={basket.id}
          type="button"
          className={activeBasket === basket.id ? "active" : ""}
          onClick={() => setActiveBasket(basket.id)}
        >
          {basket.label}
        </button>
      ))}
    </div>
  );
}

export default BasketSelector;
