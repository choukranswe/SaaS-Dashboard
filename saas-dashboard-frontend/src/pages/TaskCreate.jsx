import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ListPlus, Loader2, Plus } from 'lucide-react'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import { parseApiError } from '../utils/apiErrors'

const TaskCreate = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [form, setForm] = useState({
    project_id: '',
    assigned_to: '',
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true)
      setError('')

      try {
        const [projectsRes, usersRes] = await Promise.all([api.get('/projects'), api.get('/users')])
        setProjects(projectsRes.data)
        setUsers(usersRes.data)

        if (projectsRes.data.length > 0) {
          setForm((current) => ({ ...current, project_id: String(projectsRes.data[0].id) }))
        }
      } catch (err) {
        const parsed = parseApiError(err, 'Unable to load project and user options.')
        setError(parsed.message)
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setFieldErrors({})

    try {
      await api.post('/tasks', {
        ...form,
        project_id: Number(form.project_id),
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      })
      navigate('/tasks')
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to create task.')
      setError(parsed.message)
      setFieldErrors(parsed.errors)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="New task"
        title="Create Task"
        description="Add work to a project, assign ownership, set priority, and keep execution visible."
        action={
          <Link to="/tasks" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Tasks
          </Link>
        }
      />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      {loadingOptions ? (
        <SectionCard>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-sky-600" aria-hidden="true" />
            Loading task form
          </div>
        </SectionCard>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={ListPlus}
          title="Create a project first"
          description="Tasks need to belong to a project, so add a project before creating your first task."
          action={
            <Link to="/projects/create" className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Project
            </Link>
          }
        />
      ) : (
        <SectionCard title="Task details" description="Use clear ownership, priority, and timing so the task is actionable.">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="project_id" className="field-label">
                  Project
                </label>
                <select id="project_id" name="project_id" value={form.project_id} onChange={handleChange} className="field-input">
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.project_id?.[0] && <p className="field-error">{fieldErrors.project_id[0]}</p>}
              </div>

              <div>
                <label htmlFor="assigned_to" className="field-label">
                  Assign To
                </label>
                <select id="assigned_to" name="assigned_to" value={form.assigned_to} onChange={handleChange} className="field-input">
                  <option value="">Unassigned</option>
                  {users.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
                {fieldErrors.assigned_to?.[0] && <p className="field-error">{fieldErrors.assigned_to[0]}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="title" className="field-label">
                Title
              </label>
              <input id="title" name="title" value={form.title} onChange={handleChange} className="field-input" placeholder="Prepare onboarding checklist" />
              {fieldErrors.title?.[0] && <p className="field-error">{fieldErrors.title[0]}</p>}
            </div>

            <div>
              <label htmlFor="description" className="field-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                className="field-input resize-none"
                placeholder="Add context, requirements, or acceptance notes."
              />
              {fieldErrors.description?.[0] && <p className="field-error">{fieldErrors.description[0]}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="status" className="field-label">
                  Status
                </label>
                <select id="status" name="status" value={form.status} onChange={handleChange} className="field-input">
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                {fieldErrors.status?.[0] && <p className="field-error">{fieldErrors.status[0]}</p>}
              </div>

              <div>
                <label htmlFor="priority" className="field-label">
                  Priority
                </label>
                <select id="priority" name="priority" value={form.priority} onChange={handleChange} className="field-input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                {fieldErrors.priority?.[0] && <p className="field-error">{fieldErrors.priority[0]}</p>}
              </div>

              <div>
                <label htmlFor="due_date" className="field-label">
                  Due Date
                </label>
                <input id="due_date" name="due_date" type="date" value={form.due_date} onChange={handleChange} className="field-input" />
                {fieldErrors.due_date?.[0] && <p className="field-error">{fieldErrors.due_date[0]}</p>}
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                'Creating...'
              ) : (
                <>
                  <ListPlus className="h-4 w-4" aria-hidden="true" />
                  Create Task
                </>
              )}
            </button>
          </form>
        </SectionCard>
      )}
    </section>
  )
}

export default TaskCreate
