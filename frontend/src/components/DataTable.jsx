export default function DataTable({
  headers,
  rows,
}) {
  return (
    <div className="tableBox">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="tableFoot">
        <span>
          Showing 1 to {Math.min(rows.length, 10)}
          of {rows.length * 5} entries
        </span>

        <div className="pager">
          <button>‹</button>
          <button className="on">1</button>
          <button>2</button>
          <button>3</button>
          <button>›</button>
        </div>
      </div>
    </div>
  );
}