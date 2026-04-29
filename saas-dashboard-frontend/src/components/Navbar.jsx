import { useMemo } from 'react'
import { LogOut, Menu, Sparkles } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import RoleBadge from './RoleBadge'

const PAGE_TITLES = [
  { test: (path) => path === '/dashboard', title: 'Dashboard' },
  { test: (path) => path === '/users', title: 'Users' },
  { test: (path) => path.startsWith('/projects/create'), title: 'Create Project' },
  { test: (path) => path.startsWith('/projects/') && path.endsWith('/edit'), title: 'Edit Project' },
  { test: (path) => path === '/projects', title: 'Projects' },
  { test: (path) => path.startsWith('/tasks/create'), title: 'Create Task' },
  { test: (path) => path.startsWith('/tasks/') && path.endsWith('/edit'), title: 'Edit Task' },
  { test: (path) => path === '/tasks', title: 'Tasks' },
]

const initialsFor = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U'

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const pageTitle = useMemo(() => PAGE_TITLES.find((item) => item.test(location.pathname))?.title || 'Workspace', [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-xl font-bold text-slate-950">{pageTitle}</h1>
              <span className="hidden rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200 sm:inline-flex">
                {user?.tenant?.name || 'Workspace'}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm text-slate-500">Operate your tenant workspace with clear, role-aware controls.</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="hidden h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 md:inline-flex"
          >
            <Sparkles className="h-4 w-4 text-sky-600" aria-hidden="true" />
            Quick view
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
              {initialsFor(user?.name)}
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <RoleBadge role={user?.role} />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-950 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
