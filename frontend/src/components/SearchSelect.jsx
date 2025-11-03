import { useEffect, useId, useMemo, useState } from "react";

function SearchSelect({
  options = [],
  value = null,
  onChange,
  placeholder = "Search",
  className = "",
  showOptionId = false,
  allowEmpty = false,
}) {
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const inputId = useId();
  const radioGroupName = useId();

  const normalizedQuery = query.trim().toLowerCase();

  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return options.filter(({ id, label }) => {
      const normalizedLabel = label.toLowerCase();
      const normalizedId = String(id).toLowerCase();

      return (
        normalizedLabel.includes(normalizedQuery) ||
        normalizedId.includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, options]);

  useEffect(() => {
    if (isEditing) {
      return;
    }

    const activeOption = options.find((option) => option.id === value) ?? null;
    setQuery(activeOption?.label ?? "");
  }, [isEditing, options, value]);

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setQuery(nextValue);
    setIsMenuOpen(nextValue.trim().length > 0);
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    if (normalizedQuery) {
      setIsMenuOpen(true);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    setIsMenuOpen(false);
  };

  const handleSelection = (optionId) => {
    if (optionId === null && allowEmpty) {
      onChange?.(null);
      setQuery("");
      setIsMenuOpen(false);
      setIsEditing(false);
      return;
    }

    const option = options.find((entry) => entry.id === optionId);
    if (!option) {
      return;
    }

    onChange?.(option.id);
    setQuery(option.label);
    setIsMenuOpen(false);
    setIsEditing(false);
  };

  const rootClassName = ["search-select", className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName} role="group" aria-label={placeholder}>
      <input
        id={inputId}
        type="search"
        className="search-select__input"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        autoComplete="off"
      />
      {isMenuOpen && (
        <ul
          className="search-select__list"
          role="radiogroup"
          aria-label={`${placeholder} options`}
        >
          {allowEmpty && (
            <li className="search-select__item">
              <label
                className={`search-select__option${value === null ? " selected" : ""}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelection(null);
                }}
              >
                <input
                  type="radio"
                  name={radioGroupName}
                  value=""
                  checked={value === null}
                  onChange={() => handleSelection(null)}
                />
                <span className="search-select__label">Clear selection</span>
              </label>
            </li>
          )}
          {filteredOptions.length > 0
            ? filteredOptions.map((option) => {
                const isSelected = option.id === value;

                return (
                  <li key={option.id} className="search-select__item">
                    <label
                      className={`search-select__option${
                        isSelected ? " selected" : ""
                      }`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSelection(option.id);
                      }}
                    >
                      <input
                        type="radio"
                        name={radioGroupName}
                        value={option.id}
                        checked={isSelected}
                        onChange={() => handleSelection(option.id)}
                      />
                      <span className="search-select__label">{option.label}</span>
                      {showOptionId ? (
                        <span className="search-select__id">{option.id}</span>
                      ) : null}
                    </label>
                  </li>
                );
              })
            : !allowEmpty && (
                <li className="search-select__empty">
                  No options match your search.
                </li>
              )}
        </ul>
      )}
    </div>
  );
}

export default SearchSelect;
