import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  ListTodo,
  Plus,
  Target,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api/axios'
import ChartCard from '../components/ChartCard'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import PriorityBadge from '../components/PriorityBadge'
import StatsCard from '../components/StatsCard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../contexts/useAuth'
import { parseApiError } from '../utils/apiErrors'
import { hasPermission } from '../utils/permissions'

const STATUS_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#ef4444']
const PRIORITY_COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#f43f5e',
}
const EMPTY_LIST = []

const prettyDate = (date) => (date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-')

const countBy = (items, key, fallbackLabel = 'Unknown') => {
  const counts = items.reduce((acc, item) => {
    const rawValue = item[key] || fallbackLabel
    const label = String(rawValue)
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

const activityByDay = (projects = [], tasks = []) => {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)

    return {
      key,
      name: date.toLocaleDateString(undefined, { weekday: 'short' }),
      projects: 0,
      tasks: 0,
    }
  })

  const byKey = Object.fromEntries(days.map((day) => [day.key, day]))

  projects.forEach((project) => {
    const key = project.created_at?.slice(0, 10)
    if (byKey[key]) {
      byKey[key].projects += 1
    }
  })

  tasks.forEach((task) => {
    const key = task.created_at?.slice(0, 10)
    if (byKey[key]) {
      byKey[key].tasks += 1
    }
  })

  return days
}

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get('/dashboard')
        setStats(data)
      } catch (err) {
        const parsed = parseApiError(err, 'Unable to load dashboard stats.')
        setError(parsed.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const recentProjects = stats?.recent_projects ?? EMPTY_LIST
  const recentTasks = stats?.recent_tasks ?? EMPTY_LIST
  const completedTasks = stats?.completed_tasks || 0
  const pendingTasks = stats?.pending_tasks || 0
  const totalProjects = stats?.total_projects || 0
  const activeProjects = stats?.active_projects || 0

  const taskStatusData = useMemo(
    () =>
      recentTasks.length
        ? countBy(recentTasks, 'status')
        : [
            { name: 'Pending', value: pendingTasks },
            { name: 'Completed', value: completedTasks },
          ].filter((item) => item.value > 0),
    [completedTasks, pendingTasks, recentTasks],
  )

  const projectStatusData = useMemo(
    () =>
      recentProjects.length
        ? countBy(recentProjects, 'status')
        : [
            { name: 'Active', value: activeProjects },
            { name: 'Other', value: Math.max(totalProjects - activeProjects, 0) },
          ].filter((item) => item.value > 0),
    [activeProjects, recentProjects, totalProjects],
  )

  const priorityData = useMemo(() => countBy(recentTasks, 'priority'), [recentTasks])
  const activityData = useMemo(() => activityByDay(recentProjects, recentTasks), [recentProjects, recentTasks])

  const projectColumns = [
    {
      key: 'name',
      label: 'Project',
      render: (project) => (
        <div>
          <p className="font-semibold text-slate-950">{project.name}</p>
          <p className="mt-1 max-w-xl truncate text-xs text-slate-500">{project.description || 'No description'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (project) => <StatusBadge status={project.status} />,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (project) => prettyDate(project.created_at),
    },
  ]

  const taskColumns = [
    {
      key: 'title',
      label: 'Task',
      render: (task) => (
        <div>
          <p className="font-semibold text-slate-950">{task.title}</p>
          <p className="mt-1 text-xs text-slate-500">{task.project?.name || 'No project'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (task) => <StatusBadge status={task.status} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (task) => <PriorityBadge priority={task.priority} />,
    },
    {
      key: 'assignee',
      label: 'Owner',
      render: (task) => task.assignee?.name || 'Unassigned',
    },
  ]

  const quickActions = [
    {
      label: 'Create User',
      to: '/users',
      permission: 'users.create',
      icon: Users,
    },
    {
      label: 'Create Project',
      to: '/projects/create',
      permission: 'projects.create',
      icon: FolderKanban,
    },
    {
      label: 'Create Task',
      to: '/tasks/create',
      permission: 'tasks.create',
      icon: ListTodo,
    },
  ].filter((action) => hasPermission(user?.role, action.permission))

  return (
    <section className="space-y-7">
      <PageHeader
        eyebrow="Tenant overview"
        title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        description={`A high-level view of ${user?.tenant?.name || 'your workspace'} across users, projects, tasks, and recent operational activity.`}
        action={
          quickActions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon

                return (
                  <Link key={action.label} to={action.to} className="btn-secondary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {action.label}
                  </Link>
                )
              })}
            </div>
          )
        }
      />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatsCard title="Total Users" value={stats?.total_users ?? '-'} icon={Users} tone="blue" meta="People in this tenant" />
        <StatsCard
          title="Total Projects"
          value={stats?.total_projects ?? '-'}
          icon={FolderKanban}
          tone="indigo"
          meta="All tracked projects"
        />
        <StatsCard
          title="Active Projects"
          value={stats?.active_projects ?? '-'}
          icon={Activity}
          tone="emerald"
          meta="Currently in motion"
        />
        <StatsCard title="Total Tasks" value={stats?.total_tasks ?? '-'} icon={ClipboardList} tone="slate" meta="Across all projects" />
        <StatsCard
          title="Completed Tasks"
          value={stats?.completed_tasks ?? '-'}
          icon={CheckCircle2}
          tone="emerald"
          meta="Marked as done"
        />
        <StatsCard title="Pending Tasks" value={stats?.pending_tasks ?? '-'} icon={Target} tone="amber" meta="Todo or in progress" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard
          title="Task Status"
          description="Distribution based on current tenant task data."
          empty={!loading && taskStatusData.length === 0}
          emptyIcon={ClipboardList}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={taskStatusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4}>
                {taskStatusData.map((entry, index) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Project Status"
          description="Active and completed project mix."
          empty={!loading && projectStatusData.length === 0}
          emptyIcon={FolderKanban}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectStatusData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[10, 10, 4, 4]} fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Tasks by Priority"
          description="Priority split from latest tenant tasks."
          empty={!loading && priorityData.length === 0}
          emptyIcon={Target}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={76} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#0ea5e9'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Recent Activity"
        description="Projects and tasks created over the last seven days from available activity data."
        empty={!loading && activityData.every((item) => item.projects === 0 && item.tasks === 0)}
        emptyIcon={Activity}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activityData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tasksFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.26} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="projectsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="tasks" stroke="#0ea5e9" fill="url(#tasksFill)" strokeWidth={2} />
            <Area type="monotone" dataKey="projects" stroke="#6366f1" fill="url(#projectsFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="space-y-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-slate-950">Recent Projects</h3>
            <p className="mt-1 text-sm text-slate-500">Latest project updates in this tenant.</p>
          </div>
          <DataTable
            columns={projectColumns}
            data={recentProjects}
            loading={loading}
            emptyState={
              <EmptyState
                icon={FolderKanban}
                title="No recent projects"
                description="Create a project to start organizing tenant work."
                action={
                  hasPermission(user?.role, 'projects.create') && (
                    <Link to="/projects/create" className="btn-primary">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Create Project
                    </Link>
                  )
                }
              />
            }
          />
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-slate-950">Recent Tasks</h3>
            <p className="mt-1 text-sm text-slate-500">Newest tasks, owners, and priorities.</p>
          </div>
          <DataTable
            columns={taskColumns}
            data={recentTasks}
            loading={loading}
            emptyState={
              <EmptyState
                icon={ClipboardList}
                title="No recent tasks"
                description="Create tasks to track execution across your projects."
                action={
                  hasPermission(user?.role, 'tasks.create') && (
                    <Link to="/tasks/create" className="btn-primary">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Create Task
                    </Link>
                  )
                }
              />
            }
          />
        </div>
      </div>
    </section>
  )
}

export default Dashboard
