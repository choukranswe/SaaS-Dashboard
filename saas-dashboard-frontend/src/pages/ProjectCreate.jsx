import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FolderPlus, X } from 'lucide-react'
import api from '../api/axios'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import { parseApiError } from '../utils/apiErrors'

const ProjectCreate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'pending',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      await api.post('/projects', form)
      navigate('/projects')
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to create project.')
      setError(parsed.message)
      setFieldErrors(parsed.errors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="New project"
        title="Create Project"
        description="Set up a focused project space for tenant work, then add tasks and owners as execution starts."
        action={
          <Link to="/projects" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Projects
          </Link>
        }
      />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      <SectionCard title="Project details" description="Use a clear name and status so the portfolio stays easy to scan.">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="field-label">
              Name
            </label>
            <input id="name" name="name" value={form.name} onChange={handleChange} className="field-input" placeholder="Website Revamp" />
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
              placeholder="Describe the project scope and outcomes."
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

          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <FolderPlus className="h-4 w-4" aria-hidden="true" />
                  Create Project
                </>
              )}
            </button>
            <button type="button" onClick={() => navigate('/projects')} className="btn-secondary">
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          </div>
        </form>
      </SectionCard>
    </section>
  )
}

export default ProjectCreate
