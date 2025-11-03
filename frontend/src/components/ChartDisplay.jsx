function formatDate(isoDate) {
  if (!isoDate) {
    return "";
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function ChartDisplay({ meta, series, status }) {
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

  const points = series?.points ?? [];

  if (points.length === 0) {
    return (
      <div className="chart-display">
        <p className="status-message">No data available yet.</p>
      </div>
    );
  }

  const latestPoint = points[points.length - 1];
  const displayName = meta?.name ?? series?.name ?? "Basket";

  return (
    <div className="chart-display">
      <div className="chart-header">
        <h3>{displayName}</h3>
        <p>
          Latest observation ({formatDate(latestPoint.timestamp)}):
          <strong>
            {" "}
            {latestPoint.value.toFixed(2)}
          </strong>
        </p>
      </div>
      <table className="ratio-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.timestamp}>
              <td>{formatDate(point.timestamp)}</td>
              <td>{point.value.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="chart-footnote">
        Prototype data uses month-end closes for the selected basket and will be
        replaced by interactive charting in future iterations.
      </p>
    </div>
  );
}

export default ChartDisplay;
