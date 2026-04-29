const SectionCard = ({ title, description, action, children, className = '' }) => {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-soft ${className}`}>
      {(title || description || action) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h3 className="font-display text-lg font-semibold text-slate-950">{title}</h3>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

export default SectionCard
