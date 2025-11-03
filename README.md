# Measure-in-Goods

The Measure in Goods project explores comparing purchasing power across currencies and regions using baskets of goods as the numeraire. This repository currently contains scaffolding for the data ingestion layer, a FastAPI backend, and a React/Vite prototype frontend.

## Project structure

- `data/` – placeholder modules describing integrations with external data sources such as FRED and the World Bank.
- `src/backend/` – FastAPI application entry point, pricing utilities, and a ratio view for the S&P 500 priced in gold.
- `frontend/` – React/Vite single-page app scaffold with starter components and a shared theme.
- `pyproject.toml` – backend dependency declaration and local development helpers.

## Getting started

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install .[backend]
uvicorn src.backend.app:app --reload
```

With the server running locally you can fetch the demo ratio series. The
response is built from 2023 month-end closing values for the S&P 500 index and
gold spot prices, making the ratio more tangible than the previous synthetic
stub:

```bash
curl http://localhost:8000/ratios/sp500-gold
```

### Frontend

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

The frontend automatically loads the S&P 500 in gold ratio and renders it as a
table while charting components are under construction. The `VITE_API_URL`
environment variable is optional—the UI defaults to `http://localhost:8000`
when it is omitted.

### Data provenance & FRED® API notice

- S&P 500 price (SP500) and total return (SP500TR) series are retrieved from the
  Federal Reserve Economic Data (FRED®) API.
- This product uses the FRED® API but is not endorsed or certified by the
  Federal Reserve Bank of St. Louis.
- By using this application or any derivative dataset you agree to the
  [FRED® API Terms of Use](https://fred.stlouisfed.org/docs/api/terms_of_use.html). Downstream users
  must also comply with those terms, applicable export controls, and any other
  relevant laws or third‑party agreements.
- Applications built on top of this project should publish an appropriate
  privacy policy if they collect user data and must link to the FRED® API Terms
  of Use for their users.

### Automated data refresh & deployment

The repo ships with a GitHub Actions workflow (`.github/workflows/fetch-and-deploy.yml`) that:

1. Fetches the S&P 500 price (`SP500`) and total-return (`SP500TR`) series via the
   FRED® API.
2. Writes the JSON payloads to `frontend/public/data/` so the frontend can load
   them statically.
3. Builds the Vite frontend and deploys it to GitHub Pages.

To enable the automation you must add a repository secret named `FRED_API_KEY`
containing your personal FRED API key (GitHub → *Settings → Secrets and variables → Actions*).
You can also run the script locally:

```bash
FRED_API_KEY=your_key python data/fetch_sp500_fred.py --series-id SP500 --format json --output frontend/public/data/sp500.json
```

The frontend renders a “Daily snapshot” section so you can confirm the feeds
once the workflow (or the local script) runs.

A side project for valuing everything in terms of real-world goods.

## Abstract
Measure-in-Goods is an experiment in describing value using baskets of real goods—oil barrels, timber, staple foods, rent, electricity—instead of sticking to nominal currency. The mission is to see whether market benchmarks like SPY look different when priced in tangible resources and to give people a concrete way to compare wages, prices, and policies across regions.

## Motivation
- Inflation metrics in dollars can feel abstract; ratios in baskets are easier to picture.
- People in different countries should be able to compare experiences without reaching for exchange-rate tables.
- Economic data is more engaging when it ties back to real resources people use every day.

## Core Idea
- Define a handful of reference baskets (energy, housing, staple food, raw materials) grounded in public datasets.
- Convert asset prices, incomes, and policy metrics into units of those baskets and track them over time.
- Explore cross-asset comparisons—e.g., SPY in barrels of oil or cubic meters of timber—to surface relative trends.
- Publish charts, tables, and lightweight tools so anyone can remix the approach for their own region or research question.

## Implementation Plan
1. **Collect references**
   - Review academic papers, policy briefs, and industry reports to calibrate basket compositions.
   - Document assumptions for currency conversion, seasonality, and inflation adjustments.
2. **Gather data**
   - Pull open datasets like [World Bank Price Level Indices](https://databank.worldbank.org/source/world-development-indicators), [FAO Food Price Monitoring](https://www.fao.org/worldfoodsituation/foodpricesindex/en/), and [IEA Energy Prices](https://www.iea.org/data-and-statistics).
   - Invite community price checks through simple forms or lightweight surveys.
3. **Crunch the numbers**
   - Write scripts to tidy units, flag outliers, and translate values into basket counts.
   - Experiment with forecasting (ARIMA, Prophet) where it adds insight to relative movements.
4. **Build tools**
   - Develop dashboards or storyboards for quick visual exploration.
   - Offer an API or scheduled CSV exports so others can analyze the data.
5. **Share & iterate**
   - Publish methodology notes, known limitations, and open questions.
   - Keep feedback loops open for new basket ideas or data corrections.

## Anticipated Technology Stack
### Data Sources
- Open datasets: [World Bank WDI](https://databank.worldbank.org/source/world-development-indicators), [FAOSTAT](https://www.fao.org/faostat/en/#data), [International Energy Agency](https://www.iea.org/data-and-statistics).
- National statistics offices and crowd-sourced price diaries.
- NGO collections such as [WRI Resource Watch](https://resourcewatch.org/) and [Our World in Data](https://ourworldindata.org/food-prices).

### Data Processing & Infrastructure
- ETL orchestration with [Apache Airflow](https://airflow.apache.org/) or [Prefect](https://www.prefect.io/).
- Warehousing via [DuckDB](https://duckdb.org/) or other columnar stores such as Snowflake or BigQuery.
- Transformations with [dbt](https://www.getdbt.com/) and checks using [Great Expectations](https://greatexpectations.io/).
- Exploration in [Jupyter](https://jupyter.org/) notebooks or [Observable](https://observablehq.com/) notebooks.

### Frontend & Delivery
- Interactive web tools built with [Next.js](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/) and [Tailwind CSS](https://tailwindcss.com/).
- Visuals powered by [D3.js](https://d3js.org/) or [Vega-Lite](https://vega.github.io/vega-lite/), with [Mapbox](https://www.mapbox.com/) for maps when needed.
- Optional auth via [Auth0](https://auth0.com/) or [Clerk](https://clerk.com/) if collaboration grows.

## Use Cases
- **Policy analysis:** Evaluate whether proposed policies improve access to essentials relative to benchmark assets.
- **Labor discussions:** Compare wages to baskets of staples during negotiations.
- **NGO fieldwork:** Monitor affordability shifts in crisis zones using consistent resource metrics.
- **Research projects:** Test ideas about purchasing power, inflation, and inequality using a tangible reference point.
- **Public storytelling:** Help journalists and educators explain economic shifts with relatable examples.

## Contribution Expectations
- Start by opening an issue with your idea; sketches, mockups, and partial analyses are welcome.
- Align new datasets with the current schema and document sources and collection methods.
- Add basic tests, sanity checks, or notebooks for any new data processing steps.
- Keep documentation accessible for people who may not have an economics background.

## Roadmap & Future Milestones
- **Q1-ish:** Form a small steward group, finalize the first basket drafts, and establish the initial ETL jobs.
- **Q2-ish:** Spin up a shareable data store, release API v0.1, and invite early collaborators.
- **Q3-ish:** Launch a dashboard MVP, publish a methodology guide, and host a data deep-dive session.
- **Q4-ish:** Expand regional coverage, pilot forecasting modules, and outline a sustainability plan.
- **Later:** Explore integrations with digital wallets or policy partners if there is continued interest.

---
Questions or ideas? Open a discussion or contact the maintainer listed in the repo metadata.
