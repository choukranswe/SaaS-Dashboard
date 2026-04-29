import { ArrowUpRight } from 'lucide-react'

const TONES = {
  blue: {
    icon: 'bg-sky-50 text-sky-600 ring-sky-100',
    accent: 'from-sky-500/10 via-transparent to-transparent',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    accent: 'from-emerald-500/10 via-transparent to-transparent',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 ring-amber-100',
    accent: 'from-amber-500/10 via-transparent to-transparent',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600 ring-rose-100',
    accent: 'from-rose-500/10 via-transparent to-transparent',
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    accent: 'from-indigo-500/10 via-transparent to-transparent',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-600 ring-slate-200',
    accent: 'from-slate-500/10 via-transparent to-transparent',
  },
}

const StatsCard = ({ title, value, icon: Icon = ArrowUpRight, tone = 'slate', meta = 'Updated in real time' }) => {
  const styles = TONES[tone] || TONES.slate

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${styles.accent}`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ring-inset ${styles.icon}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <div className="relative mt-5 flex items-center gap-2 text-xs font-medium text-slate-500">
        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
        <span>{meta}</span>
      </div>
    </article>
  )
}

export default StatsCard
