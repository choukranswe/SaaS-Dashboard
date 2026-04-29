import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../contexts/useAuth'
import { parseApiError } from '../utils/apiErrors'

const Login = () => {
  const navigate = useNavigate()
  const { user, saveSession } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
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
      const { data } = await api.post('/login', form)
      saveSession(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to log in. Please check your credentials.')
      setError(parsed.message)
      setFieldErrors(parsed.errors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-auth-pattern lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden flex-col justify-between border-r border-slate-200/80 bg-white/65 px-10 py-10 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-950">SaaS Command</p>
            <p className="text-sm text-slate-500">Multi-tenant operating dashboard</p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Secure workspace</p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-tight text-slate-950">
            Manage every tenant, project, and task from one polished command center.
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Role-aware access, tenant isolation, live metrics, and clean operational workflows for modern SaaS teams.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {['Tenant isolation', 'Role controls', 'Live metrics'].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-slate-900">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <main className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-slate-950">SaaS Command</p>
              <p className="text-sm text-slate-500">Tenant dashboard</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-soft-lg">
            <h1 className="font-display text-3xl font-bold text-slate-950">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Sign in with your tenant account to continue.</p>

            {error && <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                    placeholder="password"
                  />
                </div>
                {fieldErrors.password?.[0] && <p className="field-error">{fieldErrors.password[0]}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              No account yet?{' '}
              <Link to="/register" className="font-semibold text-sky-700 transition hover:text-sky-600">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Login
