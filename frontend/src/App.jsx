import { useEffect, useMemo, useRef, useState } from "react";

import ContentSection from "./components/ContentSection.jsx";
import HeroSection from "./components/HeroSection.jsx";
import NavigationTabs from "./components/NavigationTabs.jsx";
import NoteCard from "./components/NoteCard.jsx";
import ChartDemo from "./components/ChartDemo.jsx";

const ROUTES = [
  { id: "home", label: "Home" },
  { id: "reading", label: "Reading" },
  { id: "writings", label: "Writings" },
  { id: "about", label: "About" },
];

function App() {
  const [activeRoute, setActiveRoute] = useState("home");
  const [theme, setTheme] = useState("mint");

  const sectionRefs = {
    home: useRef(null),
    reading: useRef(null),
    writings: useRef(null),
    about: useRef(null),
  };

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    []
  );

  useEffect(() => {
    const body = document.body;
    body.classList.remove("theme-mint", "theme-dark");
    body.classList.add(`theme-${theme}`);
    return () => {
      body.classList.remove(`theme-${theme}`);
    };
  }, [theme]);

  const handleRouteChange = (routeId) => {
    setActiveRoute(routeId);
    const target = sectionRefs[routeId]?.current;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleExplore = () => {
    handleRouteChange("home");
    const chartAnchor = document.getElementById("chart-demo");
    if (chartAnchor) {
      chartAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "mint" ? "dark" : "mint"));
  };

  return (
    <div className="site-root">
      <NavigationTabs
        routes={ROUTES}
        activeRoute={activeRoute}
        onRouteChange={handleRouteChange}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="site-layout">
        <HeroSection onExplore={handleExplore} />
        <NoteCard title="What is Measure in Goods?" eyebrow="Field notes">
          <p>
            An ongoing experiment in reframing macro conversations through
            tactile metaphors. Rather than defaulting to CPI releases, we model
            baskets of goods that feel real: rent, energy, staple foods, and the
            time required to earn them.
          </p>
          <p>
            Use the tabs to browse curated reading, project writings, and a
            prototype land-tax chart that reprices popular indexes in tangible
            units.
          </p>
        </NoteCard>
        <div className="site-content">
          <ContentSection
            id="home"
            ref={sectionRefs.home}
            title="Home"
            description="Start with the latest experiment: repricing markets in goods."
          >
            <div id="chart-demo">
              <ChartDemo apiBaseUrl={apiBaseUrl} />
            </div>
          </ContentSection>
          <ContentSection
            id="reading"
            ref={sectionRefs.reading}
            title="Reading"
            description="Research threads, data-heavy policy proposals, and historical context."
          >
            <ul className="content-list">
              <li>
                <strong>Land value capture:</strong> Henry George, modern tax
                experiments, and how they inform basket design.
              </li>
              <li>
                <strong>Household inflation diaries:</strong> Qualitative
                studies on how families perceive price changes.
              </li>
              <li>
                <strong>Commodity-backed accounting:</strong> Protocols that
                settle obligations in mixed baskets rather than fiat.
              </li>
            </ul>
          </ContentSection>
          <ContentSection
            id="writings"
            ref={sectionRefs.writings}
            title="Writings"
            description="Working drafts and essays from the lab."
          >
            <ul className="content-list">
              <li>
                <strong>Measuring in loaves:</strong> Rethinking wage charts
                with bakery analogies.
              </li>
              <li>
                <strong>Energy rents:</strong> A note on pairing kWh with rent
                indexes to track energy burdens.
              </li>
              <li>
                <strong>Basket prototyping:</strong> Behind the scenes on how
                we assemble weightings and select source data.
              </li>
            </ul>
          </ContentSection>
          <ContentSection
            id="about"
            ref={sectionRefs.about}
            title="About"
            description="The project, the collaborators, and where we are headed next."
          >
            <div className="about-grid">
              <p>
                Measure in Goods is a small collective of researchers exploring
                how people actually experience markets. We build prototypes that
                turn economic indicators into tangible comparisons and invite
                feedback from communities most affected by price swings.
              </p>
              <p>
                Interested in contributing datasets or collaborating on a
                feature? Reach out and let us know what you would like to see in
                the next iteration of the lab.
              </p>
            </div>
          </ContentSection>
        </div>
      </main>
    </div>
  );
}

export default App;
