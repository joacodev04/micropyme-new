export default function TablaDatos({ columns, rows, empty = "No hay registros todavía." }) {
  function renderCell(column, row) {
    if (column.render) return column.render(row);
    return row[column.key] || "-";
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td key={column.key}>{renderCell(column, row)}</td>)}
            </tr>
          )) : <tr><td colSpan={columns.length}><div className="empty-state text-center py-4">{empty}</div></td></tr>}
        </tbody>
      </table>
    </div>
  );
}
