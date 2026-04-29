const STATUS_STYLES = {
  pending: 'bg-slate-50 text-slate-700 ring-slate-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  todo: 'bg-slate-50 text-slate-700 ring-slate-200',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-200',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

const prettify = (value) => {
  if (!value) {
    return 'Unknown'
  }

  return value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {prettify(status)}
    </span>
  )
}

export default StatusBadge
