import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import api from '../api/axios'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import { parseApiError } from '../utils/apiErrors'

const normalizeDateInput = (value) => (value ? String(value).slice(0, 10) : '')

const TaskEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [form, setForm] = useState({
    project_id: '',
    assigned_to: '',
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        const [taskRes, projectsRes, usersRes] = await Promise.all([
          api.get(`/tasks/${id}`),
          api.get('/projects'),
          api.get('/users'),
        ])

        const task = taskRes.data
        setProjects(projectsRes.data)
        setUsers(usersRes.data)
        setForm({
          project_id: String(task.project_id || ''),
          assigned_to: task.assigned_to ? String(task.assigned_to) : '',
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          due_date: normalizeDateInput(task.due_date),
        })
      } catch (err) {
        const parsed = parseApiError(err, 'Unable to load task details.')
        setError(parsed.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

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
      await api.put(`/tasks/${id}`, {
        ...form,
        project_id: Number(form.project_id),
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      })
      navigate('/tasks')
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to update task.')
      setError(parsed.message)
      setFieldErrors(parsed.errors)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Task settings"
        title="Edit Task"
        description="Update assignment, priority, progress, and due date while keeping tenant boundaries intact."
        action={
          <Link to="/tasks" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Tasks
          </Link>
        }
      />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      {loading ? (
        <SectionCard>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-sky-600" aria-hidden="true" />
            Loading task details
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Task details" description="Keep the task current as ownership and progress change.">
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
              <input id="title" name="title" value={form.title} onChange={handleChange} className="field-input" />
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
                'Updating...'
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Update Task
                </>
              )}
            </button>
          </form>
        </SectionCard>
      )}
    </section>
  )
}

export default TaskEdit
