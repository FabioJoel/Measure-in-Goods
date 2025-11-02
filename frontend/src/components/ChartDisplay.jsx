function ChartDisplay({ series, status, selectionLabel }) {
  const readableLabel = selectionLabel || series?.name?.split("-").join(" ");

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

  return (
    <div className="chart-display">
      <div className="chart-header">
        <h3>{readableLabel}</h3>
        <p>
          Latest observation ({latestPoint.timestamp}):
          <strong> {latestPoint.value.toFixed(2)} oz of gold</strong>
        </p>
      </div>
      <table className="ratio-table">
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Ratio ({readableLabel})</th>
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
        Prototype data uses month-end closes for the selected basket and will be
        replaced by interactive charting in future iterations.
      </p>
    </div>
  );
}

export default ChartDisplay;
