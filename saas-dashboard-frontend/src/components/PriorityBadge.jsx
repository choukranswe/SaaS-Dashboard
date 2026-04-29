const PRIORITY_STYLES = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  high: 'bg-rose-50 text-rose-700 ring-rose-200',
}

const PriorityBadge = ({ priority }) => {
  const currentPriority = priority || 'medium'
  const label = currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1)
  const style = PRIORITY_STYLES[currentPriority] || PRIORITY_STYLES.medium

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  )
}

export default PriorityBadge
