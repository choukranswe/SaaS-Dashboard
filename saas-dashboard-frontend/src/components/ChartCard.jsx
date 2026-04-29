import EmptyState from './EmptyState'

const ChartCard = ({ title, description, children, empty, emptyIcon, emptyTitle, emptyDescription }) => {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-slate-950">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>

      {empty ? (
        <EmptyState
          compact
          icon={emptyIcon}
          title={emptyTitle || 'Not enough data yet'}
          description={emptyDescription || 'This chart will populate as your workspace activity grows.'}
        />
      ) : (
        <div className="h-72">{children}</div>
      )}
    </section>
  )
}

export default ChartCard
