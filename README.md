# Measure in Goods: The Numeraire Project

Measure in Goods explores what happens when we stop quoting everything in dollars or euros and instead express value directly in goods. By switching the numeraire from currency to commodity baskets, we highlight movements in real purchasing power and make cross-market comparisons more intuitive.

## Abstract
Let an asset time series be \(A_t\) (e.g., the S&P 500 or a housing index) and let a commodity basket be \(C_t = \sum w_i \cdot \frac{p_{i,t}}{p_{i,0}}\). We track the relative value

\[A^C_t = \frac{A_t}{C_t}\]

so that anyone can ask, “How many barrels of oil is the S&P 500 worth today?” or “How many months of rent equal last year’s wage?” The project turns this academic framing into approachable visual tools.

## Why This Matters
- **Currency drift hides real changes.** Inflation, policy decisions, and FX swings mask whether something became harder or easier to obtain.
- **People think in goods, not basis points.** Rent, food, energy, and metals provide an intuitive yardstick for both households and firms.
- **Existing theory lacks accessible tooling.** Numeraire ideas live in papers; this project packages them for everyday exploration.

## What We Are Building
1. **Reference baskets.** Energy-heavy, metals-only, and balanced baskets grounded in transparent public datasets.
2. **Asset coverage.** Equity indices, housing proxies, wage series, and policy benchmarks re-expressed in basket units.
3. **Visual experience.** A minimal web app with dropdowns, hover states, and smooth transitions that surface relative price dynamics without clutter.

## Implementation Overview
| Layer | Focus | Example Tools |
| --- | --- | --- |
| Data acquisition | Fetch open time series (FRED, World Bank, IMF, FAO, IEA). | Python, HTTP APIs, cached CSV/Parquet storage. |
| Basket construction | Normalize prices to a base date, apply weights \(w_i\), and compute \(C_t\). | Pandas/Polars, DuckDB. |
| Analytics API | Serve computed ratios and metadata for the frontend. | FastAPI/Flask, Pydantic, pytest. |
| Frontend | Interactive charts and selectors in a monochrome palette with a single accent color. | React + Vite, TypeScript, D3 or Vega-Lite. |

## Use Cases
- **Academic exploration:** Demonstrate numeraire-independence and compare real exchange rates across baskets.
- **Investor stress tests:** Re-evaluate portfolios in oil, food, or housing terms to understand regime shifts.
- **Household planning:** Translate wages or savings into tangible goods to gauge affordability changes.
- **Public storytelling:** Offer journalists and educators memorable comparisons (e.g., “A median home equals X barrels of oil”).

## Roadmap
1. **Prototype:** S&P 500, global housing, and wage benchmarks denominated in oil, gold, and cocoa.
2. **Basket selector:** Curated presets plus a custom builder with weight sliders and hover readouts.
3. **Asset expansion:** Add regional housing series, rent indices, and broad equity ETFs (VT, MSCI World).
4. **Programmatic access:** Publish an API and scheduled data exports for external analysis.
5. **Ecosystem:** Document methodology, solicit community feedback, and iterate on basket definitions.

## Contributing
- Start discussions before major additions so we can align on basket definitions and data provenance.
- Document every new dataset (source, frequency, units, caveats) and include transformation notebooks or scripts.
- Keep PRs scoped: one change per pull request with tests or validation snippets where relevant.
- Follow the minimal visual design language—black, white, and a single accent color with ample whitespace.

## Getting Involved
If the project resonates with you—whether for research, policy, or curiosity—open an issue, propose a basket, or share data sources we should evaluate. Together we can build tools that reframe value in tangible terms.
