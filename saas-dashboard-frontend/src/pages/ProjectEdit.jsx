import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import api from '../api/axios'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import { parseApiError } from '../utils/apiErrors'

const ProjectEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'pending',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get(`/projects/${id}`)
        setForm({
          name: data.name || '',
          description: data.description || '',
          status: data.status || 'pending',
        })
      } catch (err) {
        const parsed = parseApiError(err, 'Unable to load project details.')
        setError(parsed.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
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
      await api.put(`/projects/${id}`, form)
      navigate('/projects')
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to update project.')
      setError(parsed.message)
      setFieldErrors(parsed.errors)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Project settings"
        title="Edit Project"
        description="Update the project profile, status, and description while preserving existing task relationships."
        action={
          <Link to="/projects" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Projects
          </Link>
        }
      />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      {loading ? (
        <SectionCard>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-sky-600" aria-hidden="true" />
            Loading project details
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Project details" description="Changes are applied to the tenant project immediately after saving.">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="field-label">
                Name
              </label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className="field-input" />
              {fieldErrors.name?.[0] && <p className="field-error">{fieldErrors.name[0]}</p>}
            </div>

            <div>
              <label htmlFor="description" className="field-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="field-input resize-none"
              />
              {fieldErrors.description?.[0] && <p className="field-error">{fieldErrors.description[0]}</p>}
            </div>

            <div>
              <label htmlFor="status" className="field-label">
                Status
              </label>
              <select id="status" name="status" value={form.status} onChange={handleChange} className="field-input">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              {fieldErrors.status?.[0] && <p className="field-error">{fieldErrors.status[0]}</p>}
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                'Updating...'
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Update Project
                </>
              )}
            </button>
          </form>
        </SectionCard>
      )}
    </section>
  )
}

export default ProjectEdit
