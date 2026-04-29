import EmptyState from './EmptyState'

const LoadingRows = ({ columns, embedded }) => (
  <div className={embedded ? 'overflow-hidden' : 'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft'}>
    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
      <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
    </div>
    <div className="divide-y divide-slate-100">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="grid gap-4 px-5 py-4 md:grid-flow-col md:auto-cols-fr">
          {columns.slice(0, 4).map((column) => (
            <div key={`${row}-${column.key}`} className="h-4 animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  </div>
)

const DataTable = ({ columns, data = [], loading, emptyMessage = 'No records found.', emptyState, embedded = false }) => {
  if (loading) {
    return <LoadingRows columns={columns} embedded={embedded} />
  }

  if (!data.length) {
    return emptyState || <EmptyState title={emptyMessage} />
  }

  return (
    <div className={embedded ? 'overflow-hidden' : 'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft'}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50/80">
                {columns.map((column) => (
                  <td key={`${row.id}-${column.key}`} className="px-5 py-4 text-sm text-slate-700">
                    {column.render ? column.render(row) : row[column.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
