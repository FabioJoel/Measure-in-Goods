import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

function App() {
  const [theme, setTheme] = useState("mint");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const body = document.body;
    body.classList.remove("theme-mint", "theme-dark");
    body.classList.add(`theme-${theme}`);
    return () => {
      body.classList.remove(`theme-${theme}`);
    };
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((current) => (current === "mint" ? "dark" : "mint"));
  };

  const navClass = ({ isActive }) =>
    `site-nav__link${isActive ? " is-active" : ""}`;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="site">
      <header className="site-header">
        <div className="site-wrap site-header__inner">
          <button
            className="brand"
            type="button"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
          >
            <span className="brand__title">Measure in Goods</span>
            <span className="brand__subtitle">The numeraire project</span>
          </button>
          <button
            className={`menu-toggle${menuOpen ? " is-open" : ""}`}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-drawer"
            aria-label="Toggle navigation menu"
          >
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        className={`site-drawer__backdrop${menuOpen ? " is-visible" : ""}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        id="site-drawer"
        className={`site-drawer${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className="site-nav">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/data" className={navClass}>
            Data
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
        </nav>
        <div className="site-nav__section">
          <span className="site-nav__section-title">Coming soon</span>
          <ul className="site-nav__coming-list">
            <li>Custom commodity baskets</li>
            <li>Silver pricing lens</li>
            <li>CPI benchmark baskets</li>
            <li>Energy basket pricing</li>
            <li>
              <a
                href="https://en.wikipedia.org/wiki/ANCAP_(commodity_standard)"
                target="_blank"
                rel="noreferrer"
              >
                ANCAP commodity standard
              </a>
            </li>
            <li>Regional home price lenses</li>
          </ul>
        </div>
      </aside>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer site-wrap">
        © {new Date().getFullYear()} Measure in Goods. Experiments in pricing
        the world through real stuff.
      </footer>
    </div>
  );
}

export default App;
