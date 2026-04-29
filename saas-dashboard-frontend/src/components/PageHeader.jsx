const PageHeader = ({ eyebrow, title, description, action, meta }) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{eyebrow}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-3xl font-bold text-slate-950 md:text-4xl">{title}</h2>
          {meta}
        </div>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>

      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  )
}

export default PageHeader
