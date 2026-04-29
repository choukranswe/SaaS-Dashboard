import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, CheckCircle2, Edit3, Filter, ListTodo, Plus, Search, Trash2 } from 'lucide-react'
import api from '../api/axios'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import PriorityBadge from '../components/PriorityBadge'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../contexts/useAuth'
import { parseApiError } from '../utils/apiErrors'
import { hasPermission } from '../utils/permissions'

const formatDate = (date) => (date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-')

const Tasks = () => {
  const { user } = useAuth()
  const canCreate = hasPermission(user?.role, 'tasks.create')
  const canUpdate = hasPermission(user?.role, 'tasks.update')
  const canDelete = hasPermission(user?.role, 'tasks.delete')

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const loadTasks = async () => {
    setLoading(true)

    try {
      const { data } = await api.get('/tasks')
      setTasks(data)
      setError('')
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to load tasks.')
      setError(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const fetchInitialTasks = async () => {
      try {
        const { data } = await api.get('/tasks')

        if (!active) {
          return
        }

        setTasks(data)
        setError('')
      } catch (err) {
        if (!active) {
          return
        }

        const parsed = parseApiError(err, 'Unable to load tasks.')
        setError(parsed.message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchInitialTasks()

    return () => {
      active = false
    }
  }, [])

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesQuery =
        !normalizedQuery ||
        task.title?.toLowerCase().includes(normalizedQuery) ||
        task.project?.name?.toLowerCase().includes(normalizedQuery) ||
        task.assignee?.name?.toLowerCase().includes(normalizedQuery)
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

      return matchesQuery && matchesStatus && matchesPriority
    })
  }, [priorityFilter, query, statusFilter, tasks])

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) {
      return
    }

    setError('')

    try {
      await api.delete(`/tasks/${taskId}`)
      await loadTasks()
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to delete task.')
      setError(parsed.message)
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Task',
      render: (row) => (
        <div className="min-w-72">
          <p className="font-semibold text-slate-950">{row.title}</p>
          <p className="mt-1 max-w-xl truncate text-sm text-slate-500">{row.description || 'No description provided'}</p>
        </div>
      ),
    },
    {
      key: 'project',
      label: 'Project',
      render: (row) => row.project?.name || '-',
    },
    {
      key: 'assignee',
      label: 'Assigned To',
      render: (row) => row.assignee?.name || 'Unassigned',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-slate-700">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          {formatDate(row.due_date)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {canUpdate && (
            <Link to={`/tasks/${row.id}/edit`} className="btn-table">
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
        eyebrow="Execution"
        title="Tasks"
        description="Coordinate assignments, priority, progress, and deadlines across every project in the tenant."
        action={
          canCreate && (
            <Link to="/tasks/create" className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Task
            </Link>
          )
        }
      />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Todo', tasks.filter((task) => task.status === 'todo').length, 'todo'],
          ['In progress', tasks.filter((task) => task.status === 'in_progress').length, 'in_progress'],
          ['Done', tasks.filter((task) => task.status === 'done').length, 'done'],
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
              <CheckCircle2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-950">{value}</p>
          </button>
        ))}
      </div>

      <SectionCard
        title="Task list"
        description={`${filteredTasks.length} of ${tasks.length} tasks shown`}
        action={
          <div className="flex flex-col gap-2 lg:flex-row">
            <label className="flex min-w-64 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400">
              <Search className="h-4 w-4" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks"
                className="ml-2 w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none">
                <option value="all">All statuses</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="field-input lg:w-40">
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredTasks}
          loading={loading}
          embedded
          emptyState={
            <EmptyState
              icon={tasks.length ? Search : ListTodo}
              title={tasks.length ? 'No tasks match your filters' : 'No tasks created yet'}
              description={
                tasks.length
                  ? 'Adjust your search, status, or priority filter to narrow the work queue.'
                  : 'Create a task to assign work, track priority, and monitor progress.'
              }
              action={
                !tasks.length &&
                canCreate && (
                  <Link to="/tasks/create" className="btn-primary">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Create Task
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

export default Tasks
