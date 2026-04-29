import { NavLink } from 'react-router-dom'
import { CheckCircle2, FolderKanban, LayoutDashboard, Users, X } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { hasPermission } from '../utils/permissions'

const Sidebar = ({ open = false, onClose }) => {
  const { user } = useAuth()

  const links = [
    { to: '/dashboard', label: 'Dashboard', permission: 'dashboard.read', icon: LayoutDashboard },
    { to: '/users', label: 'Users', permission: 'users.read', icon: Users },
    { to: '/projects', label: 'Projects', permission: 'projects.read', icon: FolderKanban },
    { to: '/tasks', label: 'Tasks', permission: 'tasks.read', icon: CheckCircle2 },
  ]

  const visibleLinks = links.filter((link) => hasPermission(user?.role, link.permission))

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white/95 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
              <span className="font-display text-lg font-bold">SC</span>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-slate-950">SaaS Command</p>
              <p className="mt-0.5 max-w-40 truncate text-xs font-medium text-slate-500">
                {user?.tenant?.name || 'Tenant Workspace'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          <ul className="mt-3 space-y-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon

              return (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition',
                      isActive
                        ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          'flex h-9 w-9 items-center justify-center rounded-xl transition',
                          isActive ? 'bg-white/10 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 group-hover:text-slate-900',
                        ].join(' ')}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                  {link.label}
                    </>
                  )}
                </NavLink>
              </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Signed in as</p>
            <p className="mt-2 truncate text-sm font-semibold text-slate-900">{user?.name || 'Workspace user'}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
