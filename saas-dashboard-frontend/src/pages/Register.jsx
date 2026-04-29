import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, LockKeyhole, Mail, UserRound } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../contexts/useAuth'
import { parseApiError } from '../utils/apiErrors'

const Register = () => {
  const navigate = useNavigate()
  const { user, saveSession } = useAuth()
  const [form, setForm] = useState({
    tenant_name: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

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
      const { data } = await api.post('/register', form)
      saveSession(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to register company account.')
      setError(parsed.message)
      setFieldErrors(parsed.errors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-auth-pattern px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-950">SaaS Command</p>
            <p className="text-sm text-slate-500">Create a tenant workspace</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-soft-lg">
          <h1 className="font-display text-3xl font-bold text-slate-950">Create your company account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Your first user will be created as the tenant admin.</p>

          {error && <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label htmlFor="tenant_name" className="field-label">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="tenant_name"
                  name="tenant_name"
                  type="text"
                  value={form.tenant_name}
                  onChange={handleChange}
                  className="field-input pl-10"
                  placeholder="PixelWeb"
                />
              </div>
              {fieldErrors.tenant_name?.[0] && <p className="field-error">{fieldErrors.tenant_name[0]}</p>}
            </div>

            <div>
              <label htmlFor="name" className="field-label">
                Full Name
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="field-input pl-10" placeholder="Jane Doe" />
              </div>
              {fieldErrors.name?.[0] && <p className="field-error">{fieldErrors.name[0]}</p>}
            </div>

            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="field-input pl-10"
                  placeholder="admin@pixelweb.com"
                />
              </div>
              {fieldErrors.email?.[0] && <p className="field-error">{fieldErrors.email[0]}</p>}
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="field-input pl-10"
                  placeholder="Minimum 8 characters"
                />
              </div>
              {fieldErrors.password?.[0] && <p className="field-error">{fieldErrors.password[0]}</p>}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="field-label">
                Confirm Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  className="field-input pl-10"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Creating account...' : 'Create account'}
                {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-sky-700 transition hover:text-sky-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Register
