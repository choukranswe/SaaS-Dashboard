import { Inbox } from 'lucide-react'

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'Create your first record or adjust the current filters.',
  action,
  compact = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 text-center ${
        compact ? 'px-5 py-8' : 'px-6 py-12'
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sky-600 shadow-sm">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default EmptyState
