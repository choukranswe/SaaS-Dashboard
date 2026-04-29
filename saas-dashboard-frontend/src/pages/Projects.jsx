import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, Filter, FolderKanban, Plus, Search, Trash2 } from 'lucide-react'
import api from '../api/axios'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../contexts/useAuth'
import { parseApiError } from '../utils/apiErrors'
import { hasPermission } from '../utils/permissions'

const Projects = () => {
  const { user } = useAuth()
  const canCreate = hasPermission(user?.role, 'projects.create')
  const canUpdate = hasPermission(user?.role, 'projects.update')
  const canDelete = hasPermission(user?.role, 'projects.delete')

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadProjects = async () => {
    setLoading(true)

    try {
      const { data } = await api.get('/projects')
      setProjects(data)
      setError('')
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to load projects.')
      setError(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const fetchInitialProjects = async () => {
      try {
        const { data } = await api.get('/projects')

        if (!active) {
          return
        }

        setProjects(data)
        setError('')
      } catch (err) {
        if (!active) {
          return
        }

        const parsed = parseApiError(err, 'Unable to load projects.')
        setError(parsed.message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchInitialProjects()

    return () => {
      active = false
    }
  }, [])

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesQuery =
        !normalizedQuery ||
        project.name?.toLowerCase().includes(normalizedQuery) ||
        project.description?.toLowerCase().includes(normalizedQuery) ||
        project.creator?.name?.toLowerCase().includes(normalizedQuery)
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [projects, query, statusFilter])

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project?')) {
      return
    }

    setError('')

    try {
      await api.delete(`/projects/${projectId}`)
      await loadProjects()
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to delete project.')
      setError(parsed.message)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Project',
      render: (row) => (
        <div className="min-w-72">
          <p className="font-semibold text-slate-950">{row.name}</p>
          <p className="mt-1 max-w-xl truncate text-sm text-slate-500">{row.description || 'No description provided'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'tasks_count',
      label: 'Tasks',
      render: (row) => <span className="font-semibold text-slate-900">{row.tasks_count ?? 0}</span>,
    },
    {
      key: 'creator',
      label: 'Created By',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.creator?.name || '-'}</p>
          {row.creator?.email && <p className="mt-0.5 text-xs text-slate-500">{row.creator.email}</p>}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {canUpdate && (
            <Link to={`/projects/${row.id}/edit`} className="btn-table">
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </Link>
          )}
          {canDelete && (
            <button type="button" onClick={() => handleDelete(row.id)} className="btn-danger">
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </button>
          )}
          {!canUpdate && !canDelete && <span className="text-xs font-medium text-slate-400">Read only</span>}
        </div>
      ),
    },
  ]

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Project portfolio"
        title="Projects"
        description="Track tenant projects, ownership, status, and delivery momentum in one focused view."
        action={
          canCreate && (
            <Link to="/projects/create" className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Project
            </Link>
          )
        }
      />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['All projects', projects.length, 'all'],
          ['Active', projects.filter((project) => project.status === 'active').length, 'active'],
          ['Completed', projects.filter((project) => project.status === 'completed').length, 'completed'],
        ].map(([label, value, status]) => (
          <button
            key={label}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-2xl border bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg ${
              statusFilter === status ? 'border-sky-300 ring-4 ring-sky-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <FolderKanban className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-950">{value}</p>
          </button>
        ))}
      </div>

      <SectionCard
        title="Project list"
        description={`${filteredProjects.length} of ${projects.length} projects shown`}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex min-w-64 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400">
              <Search className="h-4 w-4" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects"
                className="ml-2 w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredProjects}
          loading={loading}
          embedded
          emptyState={
            <EmptyState
              icon={projects.length ? Search : FolderKanban}
              title={projects.length ? 'No projects match your filters' : 'No projects yet'}
              description={
                projects.length
                  ? 'Adjust your search or status filter to find the project you need.'
                  : 'Create your first project to start grouping tasks and tracking work.'
              }
              action={
                !projects.length &&
                canCreate && (
                  <Link to="/projects/create" className="btn-primary">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Create Project
                  </Link>
                )
              }
            />
          }
        />
      </SectionCard>
    </section>
  )
}

export default Projects
