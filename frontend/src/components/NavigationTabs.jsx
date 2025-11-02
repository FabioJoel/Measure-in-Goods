function NavigationTabs({ routes, activeRoute, onRouteChange, theme, onToggleTheme }) {
  return (
    <header className="site-nav" role="banner">
      <div className="site-nav__inner">
        <div className="site-nav__brand">
          <span className="brand-mark" aria-hidden="true">
            ∴
          </span>
          <div>
            <p className="brand-eyebrow">Measure in Goods</p>
            <p className="brand-title">Purchasing Power Lab</p>
          </div>
        </div>
        <nav className="site-nav__tabs" aria-label="Primary navigation">
          {routes.map((route) => {
            const isActive = route.id === activeRoute;
            return (
              <button
                key={route.id}
                type="button"
                className={`site-nav__tab${isActive ? " is-active" : ""}`}
                onClick={() => onRouteChange?.(route.id)}
                aria-current={isActive ? "page" : undefined}
              >
                {route.label}
              </button>
            );
          })}
        </nav>
        <button type="button" className="theme-toggle" onClick={onToggleTheme}>
          <span className="theme-toggle__label">
            {theme === "dark" ? "Switch to mint" : "Switch to dark"}
          </span>
          <span className="theme-toggle__thumb" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export default NavigationTabs;
