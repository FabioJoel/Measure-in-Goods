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
        <p className="status-message error">Unable to load ratio: {status.message}</p>
      </div>
    );
  }

  if (!series || !series.points?.length) {
    return (
      <div className="chart-display">
        <p className="status-message">No data available yet.</p>
      </div>
    );
  }

  const latestPoint = series.points[series.points.length - 1];
  const displayName = meta?.label ?? meta?.name ?? series.name;
  const units = meta?.denominator_units ?? meta?.units ?? "oz of gold";

  return (
    <div className="chart-display">
      <div className="chart-header">
        <h3>{displayName.split("-").join(" ")}</h3>
        <p>
          Latest observation ({latestPoint.timestamp}):
          <strong>
            {" "}
            {latestPoint.value.toFixed(2)} {units}
          </strong>
        </p>
      </div>
      <table className="ratio-table">
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Ratio ({displayName})</th>
          </tr>
        </thead>
        <tbody>
          {series.points.map((point) => (
            <tr key={point.timestamp}>
              <td>{point.timestamp}</td>
              <td>{point.value.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="chart-footnote">
        Prototype data uses 2023 month-end closes for the S&amp;P 500 index and
        gold spot price. Interactive charting will replace this table in future
        iterations.
      </p>
    </div>
  );
}

export default ChartDisplay;
