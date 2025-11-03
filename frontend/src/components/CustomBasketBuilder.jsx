import { useMemo, useState } from "react";

function normalizeWeights(rawItems) {
  if (!rawItems.length) {
    return rawItems;
  }
  const total = rawItems.reduce(
    (sum, entry) => sum + (entry.weight ?? 0),
    0
  );
  if (total <= 0) {
    const equalWeight = 1 / rawItems.length;
    return rawItems.map((entry) => ({ ...entry, weight: equalWeight }));
  }
  return rawItems.map((entry) => ({
    ...entry,
    weight: entry.weight / total,
  }));
}

function CustomBasketBuilder({
  resources,
  items = [],
  onItemsChange,
  maxItems = 6,
}) {
  const [query, setQuery] = useState("");

  const normalizedItems = useMemo(
    () => normalizeWeights(items),
    [items]
  );

  const selectedItems = useMemo(() => {
    const lookup = new Map(normalizedItems.map((item) => [item.id, item]));
    return resources
      .filter((resource) => lookup.has(resource.id))
      .map((resource) => ({
        ...resource,
        weight: lookup.get(resource.id)?.weight ?? 0,
      }));
  }, [normalizedItems, resources]);

  const totalPercentage = Math.round(
    selectedItems.reduce((sum, item) => sum + item.weight * 100, 0)
  );

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return resources;
    }

    return resources.filter((resource) => {
      const haystack = `${resource.label} ${resource.category}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query, resources]);

  const handleToggleResource = (resourceId) => {
    const isActive = normalizedItems.some((entry) => entry.id === resourceId);

    if (isActive) {
      const remaining = normalizedItems.filter(
        (entry) => entry.id !== resourceId
      );
      onItemsChange?.(normalizeWeights(remaining));
    } else if (normalizedItems.length < maxItems) {
      const nextItems = [
        ...normalizedItems,
        { id: resourceId, weight: 1 / (normalizedItems.length + 1) },
      ];
      onItemsChange?.(normalizeWeights(nextItems));
    }
  };

  const handleWeightChange = (resourceId, nextValue) => {
    const rawWeight = Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue);
    const updated = normalizedItems.map((entry) =>
      entry.id === resourceId ? { ...entry, weight: rawWeight / 100 } : entry
    );
    onItemsChange?.(normalizeWeights(updated));
  };

  return (
    <div className="basket-builder">
      <div className="basket-builder__header">
        <h3>Create a basket</h3>
        <p>Select up to {maxItems} resources and set their weights.</p>
      </div>
      <div className="basket-builder__content">
        <div className="basket-builder__catalog">
          <label className="basket-builder__search">
            <span className="sr-only">Search resources</span>
            <input
              type="search"
              placeholder="Search resources"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <ul className="basket-builder__resource-list">
            {filteredResources.map((resource) => {
              const isActive = normalizedItems.some(
                (entry) => entry.id === resource.id
              );
              const disabled = !isActive && normalizedItems.length >= maxItems;

              return (
                <li key={resource.id}>
                  <button
                    type="button"
                    className={`basket-builder__resource${isActive ? " is-active" : ""}`}
                    onClick={() => handleToggleResource(resource.id)}
                    disabled={disabled}
                  >
                    <span>
                      <strong>{resource.label}</strong>
                      <small>{resource.category}</small>
                    </span>
                    <span className="basket-builder__resource-meta">
                      {isActive
                        ? "Selected"
                        : disabled
                          ? "Limit reached"
                          : "Add"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="basket-builder__selections">
          <h4>Basket mix</h4>
          {selectedItems.length === 0 ? (
            <p className="basket-builder__empty">
              Choose resources to start shaping your custom basket.
            </p>
          ) : (
            <ul className="basket-builder__selection-list">
              {selectedItems.map((item) => (
                <li key={item.id} className="basket-builder__selection">
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.category}</small>
                  </div>
                  <div className="basket-builder__quantity">
                    <label>
                      <span className="sr-only">Percentage for {item.label}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={Math.round(item.weight * 100)}
                        onChange={(event) =>
                          handleWeightChange(item.id, Number(event.target.value))
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="basket-builder__remove"
                      onClick={() =>
                        onItemsChange?.(
                          normalizeWeights(
                            normalizedItems.filter(
                              (entry) => entry.id !== item.id
                            )
                          )
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <footer className="basket-builder__footer">
          <p>
            Total allocation:{" "}
            <strong>{totalPercentage}%</strong>
            {selectedItems.length > 0 && totalPercentage !== 100 ? (
              <span className="basket-builder__warning">
                {" "}
                (adjust weights to total 100%)
              </span>
            ) : null}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default CustomBasketBuilder;
