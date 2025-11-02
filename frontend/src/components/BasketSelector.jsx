import { useRef } from "react";
import Pill from "./Pill.jsx";

function BasketSelector({ options = [], activeBasket, onSelect = () => {} }) {
  if (!options.length) {
    return null;
  }

  const tabRefs = useRef([]);

  const focusTab = (index) => {
    // Defer focus until after React commits the DOM updates for the new state.
    setTimeout(() => {
      tabRefs.current[index]?.focus();
    }, 0);
  };

  const getNextIndex = (current, direction) => {
    const total = options.length;
    if (direction === "forward") {
      return (current + 1) % total;
    }
    return (current - 1 + total) % total;
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = getNextIndex(index, "forward");
      const nextOption = options[nextIndex];
      onSelect(nextOption.id);
      focusTab(nextIndex);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const previousIndex = getNextIndex(index, "backward");
      const previousOption = options[previousIndex];
      onSelect(previousOption.id);
      focusTab(previousIndex);
    } else if (event.key === "Home") {
      event.preventDefault();
      onSelect(options[0].id);
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      const lastIndex = options.length - 1;
      onSelect(options[lastIndex].id);
      focusTab(lastIndex);
    }
  };

  return (
    <div
      className="basket-selector"
      role="tablist"
      aria-label="Reference basket indexes"
      aria-orientation="horizontal"
    >
      {options.map((option, index) => {
        const isActive = option.id === activeBasket;
        return (
          <Pill
            key={option.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            active={isActive}
            onClick={() => onSelect(option.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
          >
            {option.label}
          </Pill>
        );
      })}
    </div>
  );
}

export default BasketSelector;
