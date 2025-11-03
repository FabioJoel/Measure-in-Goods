import { useEffect, useMemo, useRef, useState } from "react";

const RANGE_OPTIONS = [
  { id: "3m", label: "3M", days: 90 },
  { id: "1y", label: "1Y", days: 365 },
  { id: "5y", label: "5Y", days: 1825 },
  { id: "10y", label: "10Y", days: 3650 },
  { id: "max", label: "MAX", days: Infinity },
];

const CHART_MARGIN = { top: 28, right: 32, bottom: 52, left: 72 };

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
});

function formatValue(value, { compact = false } = {}) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  try {
    if (compact) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    }

    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value);
  } catch (_error) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: compact ? 1 : value >= 1000 ? 0 : 2,
    });
  }
}

function normalizeSeries(points = []) {
  return points
    .map((point) => {
      const iso = point.timestamp ?? point.date;
      const numericValue = Number.parseFloat(point.value);
      const parsedDate = iso ? new Date(iso) : null;

      if (!iso || !Number.isFinite(numericValue) || !parsedDate || Number.isNaN(parsedDate.getTime())) {
        return null;
      }

      return {
        iso,
        date: parsedDate,
        value: numericValue,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);
}

function filterByRange(points, rangeId) {
  if (!Array.isArray(points) || points.length === 0) {
    return [];
  }

  if (rangeId === "max") {
    return points;
  }

  const option = RANGE_OPTIONS.find((entry) => entry.id === rangeId);
  if (!option || !Number.isFinite(option.days)) {
    return points;
  }

  const lastDate = points[points.length - 1].date;
  const cutoff = new Date(lastDate);
  cutoff.setDate(cutoff.getDate() - option.days);

  return points.filter((point) => point.date >= cutoff);
}

function buildChartGeometry(points, size) {
  if (!Array.isArray(points) || points.length < 2) {
    return {
      chartPoints: [],
      linePath: "",
      areaPath: "",
      yTicks: [],
      xTicks: [],
      baselineY: 0,
    };
  }

  const width = Math.max(size.width, CHART_MARGIN.left + CHART_MARGIN.right + 60);
  const height = size.height;
  const innerWidth = width - CHART_MARGIN.left - CHART_MARGIN.right;
  const innerHeight = height - CHART_MARGIN.top - CHART_MARGIN.bottom;

  const minDate = points[0].date.getTime();
  const maxDate = points[points.length - 1].date.getTime();
  const dateRange = maxDate - minDate || 1;

  const values = points.map((entry) => entry.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue || maxValue || 1) * 0.08;
  const paddedMin = minValue - padding;
  const paddedMax = maxValue + padding;
  const valueRange = paddedMax - paddedMin || 1;

  const chartPoints = points.map((entry) => {
    const x =
      CHART_MARGIN.left +
      ((entry.date.getTime() - minDate) / dateRange) * innerWidth;
    const y =
      CHART_MARGIN.top +
      (1 - (entry.value - paddedMin) / valueRange) * innerHeight;

    return {
      ...entry,
      x,
      y,
    };
  });

  const baselineY = height - CHART_MARGIN.bottom;
  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");

  const areaPath =
    `M ${chartPoints[0].x} ${baselineY} ` +
    chartPoints.map((point) => `L ${point.x} ${point.y}`).join(" ") +
    ` L ${chartPoints[chartPoints.length - 1].x} ${baselineY} Z`;

  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount }, (_, index) => {
    const ratio = index / (yTickCount - 1);
    const value = paddedMax - ratio * valueRange;
    const y = CHART_MARGIN.top + ratio * innerHeight;
    return { value, y };
  });

  const xTicks = [
    chartPoints[0],
    chartPoints[Math.floor(chartPoints.length / 2)],
    chartPoints[chartPoints.length - 1],
  ].reduce((acc, point) => {
    if (!acc.find((tick) => tick.date.getTime() === point.date.getTime())) {
      acc.push(point);
    }
    return acc;
  }, []);

  return {
    chartPoints,
    linePath,
    areaPath,
    yTicks,
    xTicks,
    baselineY,
    width,
    height,
  };
}

function findNearestIndex(points, x) {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }

  let bestIndex = 0;
  let bestDistance = Infinity;

  points.forEach((point, index) => {
    const distance = Math.abs(point.x - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export default function ChartDisplay({ meta, series, status }) {
  const chartRef = useRef(null);
  const [size, setSize] = useState({ width: 920, height: 360 });
  const [rangeId, setRangeId] = useState("max");
  const [hoverIndex, setHoverIndex] = useState(null);

  useEffect(() => {
    const element = chartRef.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const nextWidth = Math.max(entry.contentRect.width, 320);
      const nextHeight = Math.max(
        260,
        Math.min(440, nextWidth * 0.45)
      );

      setSize({ width: nextWidth, height: nextHeight });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setHoverIndex(null);
  }, [series, rangeId]);

  const normalizedPoints = useMemo(
    () => normalizeSeries(series?.points),
    [series?.points]
  );

  const filteredPoints = useMemo(
    () => filterByRange(normalizedPoints, rangeId),
    [normalizedPoints, rangeId]
  );

  const geometry = useMemo(
    () => buildChartGeometry(filteredPoints, size),
    [filteredPoints, size]
  );

  if (status.state === "loading") {
    return (
      <div className="chart-display">
        <p className="status-message">{status.message || "Loading…"}</p>
      </div>
    );
  }

  if (status.state === "error") {
    return (
      <div className="chart-display">
        <div className="chart-placeholder">
          <div className="chart-placeholder__canvas" aria-hidden="true">
            <svg viewBox="0 0 100 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartPlaceholderFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(160, 184, 180, 0.3)" />
                  <stop offset="100%" stopColor="rgba(160, 184, 180, 0)" />
                </linearGradient>
              </defs>
              <polygon
                points="0,55 10,52 20,46 30,50 40,38 50,44 60,30 70,36 80,24 90,32 100,18 100,60 0,60"
                fill="url(#chartPlaceholderFill)"
              />
              <polyline
                points="0,55 10,52 20,46 30,50 40,38 50,44 60,30 70,36 80,24 90,32 100,18"
                fill="none"
                stroke="rgba(160, 184, 180, 0.35)"
                strokeWidth="0.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1.6 1.6"
              />
            </svg>
          </div>
          <p className="status-message error">{status.message}</p>
        </div>
      </div>
    );
  }

  if (normalizedPoints.length === 0) {
    return (
      <div className="chart-display">
        <p className="status-message">No data available yet.</p>
      </div>
    );
  }

  if (geometry.chartPoints.length < 2) {
    return (
      <div className="chart-display">
        <div className="chart-header">
          <h3>{meta?.name ?? series?.name ?? "Basket"}</h3>
          <p>Need more observations before rendering a chart.</p>
        </div>
      </div>
    );
  }

  const rangeLabel =
    RANGE_OPTIONS.find((option) => option.id === rangeId)?.label ?? "MAX";
  const pointForDisplay =
    hoverIndex != null
      ? geometry.chartPoints[hoverIndex]
      : geometry.chartPoints[geometry.chartPoints.length - 1];

  const handlePointerMove = (event) => {
    if (!geometry.chartPoints.length) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const index = findNearestIndex(geometry.chartPoints, x);
    setHoverIndex(index);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  const tooltipPoint =
    hoverIndex != null ? geometry.chartPoints[hoverIndex] : null;

  const tooltipLeft = tooltipPoint
    ? Math.min(
        Math.max(tooltipPoint.x, CHART_MARGIN.left + 12),
        geometry.width - 140
      )
    : 0;

  return (
    <div className="chart-display">
      <div className="chart-header">
        <div className="chart-header__meta">
          <h3>{meta?.name ?? series?.name ?? "Basket"}</h3>
          <p>{rangeLabel} range</p>
        </div>
        <div
          className="range-toggle"
          role="group"
          aria-label="Select time range"
        >
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`range-toggle__button${
                rangeId === option.id ? " is-active" : ""
              }`}
              onClick={() => setRangeId(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-summary">
        <div className="chart-summary__group">
          <span className="chart-summary__label">Price</span>
          <strong className="chart-summary__value">
            {formatValue(pointForDisplay.value)}
          </strong>
          <span className="chart-summary__date">
            {LONG_DATE_FORMATTER.format(pointForDisplay.date)}
          </span>
        </div>
      </div>

      <div className="ratio-chart" ref={chartRef}>
        <svg
          width={geometry.width}
          height={geometry.height}
          viewBox={`0 0 ${geometry.width} ${geometry.height}`}
          role="img"
          aria-label={`${meta?.name ?? series?.name ?? "basket"} time series`}
        >
          <defs>
            <linearGradient id="ratioLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-strong)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
            <linearGradient id="ratioAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--accent-strong)"
                stopOpacity="0.26"
              />
              <stop
                offset="100%"
                stopColor="var(--accent)"
                stopOpacity="0.05"
              />
            </linearGradient>
          </defs>

          <g className="ratio-chart__grid">
            {geometry.yTicks.map((tick, index) => (
              <g key={`y-${index}`}>
                <line
                  x1={CHART_MARGIN.left}
                  x2={geometry.width - CHART_MARGIN.right}
                  y1={tick.y}
                  y2={tick.y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />
                <text
                  x={CHART_MARGIN.left - 14}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="ratio-chart__tick"
                >
                  {formatValue(tick.value, { compact: true })}
                </text>
              </g>
            ))}
          </g>

          <g className="ratio-chart__axis">
            <line
              x1={CHART_MARGIN.left}
              x2={geometry.width - CHART_MARGIN.right}
              y1={geometry.baselineY}
              y2={geometry.baselineY}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
            {geometry.xTicks.map((tick, index) => (
              <text
                key={`x-${index}`}
                x={tick.x}
                y={geometry.height - 18}
                textAnchor="middle"
                className="ratio-chart__tick"
              >
                {SHORT_DATE_FORMATTER.format(tick.date)}
              </text>
            ))}
          </g>

          <path
            d={geometry.areaPath}
            fill="url(#ratioAreaGradient)"
            stroke="none"
          />
          <path
            d={geometry.linePath}
            fill="none"
            stroke="url(#ratioLineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {hoverIndex != null && tooltipPoint ? (
            <>
              <line
                x1={tooltipPoint.x}
                x2={tooltipPoint.x}
                y1={CHART_MARGIN.top}
                y2={geometry.baselineY}
                className="ratio-chart__crosshair"
              />
              <circle
                cx={tooltipPoint.x}
                cy={tooltipPoint.y}
                r="5"
                fill="var(--accent-strong)"
                stroke="rgba(0, 0, 0, 0.65)"
                strokeWidth="1.2"
              />
            </>
          ) : (
            <circle
              cx={geometry.chartPoints[geometry.chartPoints.length - 1].x}
              cy={geometry.chartPoints[geometry.chartPoints.length - 1].y}
              r="4.4"
              fill="var(--accent-strong)"
              stroke="rgba(0, 0, 0, 0.6)"
              strokeWidth="1"
            />
          )}

          <rect
            className="ratio-chart__hitbox"
            x={CHART_MARGIN.left}
            y={CHART_MARGIN.top}
            width={geometry.width - CHART_MARGIN.left - CHART_MARGIN.right}
            height={geometry.height - CHART_MARGIN.top - CHART_MARGIN.bottom}
            fill="transparent"
            onPointerMove={handlePointerMove}
            onPointerEnter={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          />
        </svg>

        {tooltipPoint ? (
          <div
            className="ratio-chart__tooltip"
            style={{
              left: `${tooltipLeft}px`,
              top: `${CHART_MARGIN.top + 12}px`,
            }}
          >
            <span className="ratio-chart__tooltip-date">
              {LONG_DATE_FORMATTER.format(tooltipPoint.date)}
            </span>
            <strong className="ratio-chart__tooltip-value">
              {formatValue(tooltipPoint.value)}
            </strong>
          </div>
        ) : null}
      </div>

      <p className="chart-footnote">
        Hover or tap to inspect individual observations. More overlays, basket
        comparisons, and export tools are on the roadmap.
      </p>
    </div>
  );
}
