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
