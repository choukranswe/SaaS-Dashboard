import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Download,
  Edit3,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Upload,
  UserRoundPlus,
  Users as UsersIcon,
  X,
} from 'lucide-react'
import api from '../api/axios'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import RoleBadge from '../components/RoleBadge'
import SectionCard from '../components/SectionCard'
import { useAuth } from '../contexts/useAuth'
import { parseApiError } from '../utils/apiErrors'
import { hasPermission } from '../utils/permissions'

const emptyForm = {
  name: '',
  email: '',
  role: 'viewer',
  password: '',
  password_confirmation: '',
}

const sampleCsv = [
  'name,email,role,password',
  'Manager One,manager1@example.com,manager,password123',
  'Viewer One,viewer1@example.com,viewer,password123',
  'Viewer Two,viewer2@example.com,viewer,password123',
].join('\n')

const Users = () => {
  const { user } = useAuth()
  const canCreate = hasPermission(user?.role, 'users.create')
  const canUpdate = hasPermission(user?.role, 'users.update')
  const canDelete = hasPermission(user?.role, 'users.delete')
  const canImport = user?.role === 'admin'

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [showImportPanel, setShowImportPanel] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importFieldErrors, setImportFieldErrors] = useState({})
  const [importResult, setImportResult] = useState(null)

  const loadUsers = async () => {
    setLoading(true)

    try {
      const { data } = await api.get('/users')
      setUsers(data)
      setError('')
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to load users.')
      setError(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const fetchInitialUsers = async () => {
      try {
        const { data } = await api.get('/users')

        if (!active) {
          return
        }

        setUsers(data)
        setError('')
      } catch (err) {
        if (!active) {
          return
        }

        const parsed = parseApiError(err, 'Unable to load users.')
        setError(parsed.message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchInitialUsers()

    return () => {
      active = false
    }
  }, [])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return users.filter((member) => {
      const matchesQuery =
        !normalizedQuery ||
        member.name?.toLowerCase().includes(normalizedQuery) ||
        member.email?.toLowerCase().includes(normalizedQuery) ||
        member.role?.toLowerCase().includes(normalizedQuery)
      const matchesRole = roleFilter === 'all' || member.role === roleFilter

      return matchesQuery && matchesRole
    })
  }, [query, roleFilter, users])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingUser(null)
    setShowForm(false)
    setFieldErrors({})
  }

  const openCreateForm = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setFieldErrors({})
    setShowForm(true)
  }

  const openImportPanel = () => {
    setShowImportPanel(true)
    setImportError('')
    setImportFieldErrors({})
    setImportResult(null)
  }

  const closeImportPanel = () => {
    setShowImportPanel(false)
    setImportFile(null)
    setImportError('')
    setImportFieldErrors({})
  }

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'users-import-sample.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const openEditForm = (selectedUser) => {
    setEditingUser(selectedUser)
    setForm({
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
      password: '',
      password_confirmation: '',
    })
    setFieldErrors({})
    setShowForm(true)
  }

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
      if (editingUser) {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
        }

        if (form.password) {
          payload.password = form.password
          payload.password_confirmation = form.password_confirmation
        }

        await api.put(`/users/${editingUser.id}`, payload)
      } else {
        await api.post('/users', form)
      }

      await loadUsers()
      resetForm()
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to save user.')
      setError(parsed.message)
      setFieldErrors(parsed.errors)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) {
      return
    }

    setError('')

    try {
      await api.delete(`/users/${userId}`)
      await loadUsers()
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to delete user.')
      setError(parsed.message)
    }
  }

  const handleImportSubmit = async (event) => {
    event.preventDefault()
    setImportError('')
    setImportFieldErrors({})
    setImportResult(null)

    if (!importFile) {
      setImportFieldErrors({ file: ['Please choose a CSV file to import.'] })
      return
    }

    const payload = new FormData()
    payload.append('file', importFile)
    setImporting(true)

    try {
      const { data } = await api.post('/users/import-csv', payload)
      setImportResult(data)
      await loadUsers()
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to import CSV.')
      setImportError(parsed.message)
      if (Array.isArray(parsed.errors)) {
        setImportResult({
          message: parsed.message,
          imported_count: 0,
          failed_count: parsed.errors.length,
          errors: parsed.errors,
        })
      } else {
        setImportFieldErrors(parsed.errors)
      }
    } finally {
      setImporting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
            {row.name
              ?.split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part.charAt(0).toUpperCase())
              .join('') || 'U'}
          </div>
          <div>
            <p className="font-semibold text-slate-950">{row.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {canUpdate && (
            <button type="button" onClick={() => openEditForm(row)} className="btn-table">
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </button>
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
        eyebrow="Access control"
        title="Users"
        description="Manage tenant members, roles, and account access without leaving the workspace context."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canImport && (
              <button type="button" onClick={openImportPanel} className="btn-secondary">
                <Upload className="h-4 w-4" aria-hidden="true" />
                Import CSV
              </button>
            )}
            {canCreate && (
              <button type="button" onClick={openCreateForm} className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add User
              </button>
            )}
          </div>
        }
      />

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      {showImportPanel && canImport && (
        <SectionCard
          title="Import users from CSV"
          description="Imported users are created only inside your current tenant. CSV tenant_id values are ignored."
          action={
            <button type="button" onClick={closeImportPanel} className="btn-secondary">
              <X className="h-4 w-4" aria-hidden="true" />
              Close
            </button>
          }
        >
          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="field-label" htmlFor="csv-file">
                  CSV file
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-sky-300 hover:bg-sky-50/40">
                  <FileSpreadsheet className="h-8 w-8 text-sky-600" aria-hidden="true" />
                  <span className="mt-3 text-sm font-semibold text-slate-900">
                    {importFile ? importFile.name : 'Choose a CSV or TXT file'}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">Maximum file size: 2MB</span>
                  <input
                    id="csv-file"
                    type="file"
                    accept=".csv,.txt,text/csv,text/plain"
                    className="sr-only"
                    onChange={(event) => {
                      setImportFile(event.target.files?.[0] || null)
                      setImportFieldErrors({})
                      setImportError('')
                    }}
                  />
                </label>
                {importFieldErrors.file?.[0] && <p className="field-error">{importFieldErrors.file[0]}</p>}
              </div>

              {importError && (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{importError}</p>
              )}

              {importResult && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <p className="font-semibold">{importResult.message}</p>
                  <p className="mt-1">
                    Imported {importResult.imported_count} users. {importResult.failed_count} rows failed.
                  </p>
                </div>
              )}

              {importResult?.errors?.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    Rows needing attention
                  </div>
                  <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                    {importResult.errors.map((rowError) => (
                      <div key={`${rowError.row}-${rowError.email || 'unknown'}`} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                        <p className="font-semibold text-slate-900">
                          Row {rowError.row}
                          {rowError.email ? `: ${rowError.email}` : ''}
                        </p>
                        <ul className="mt-1 space-y-1 text-xs text-slate-600">
                          {rowError.errors.map((message, index) => (
                            <li key={`${message}-${index}`}>{message}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button type="submit" disabled={importing} className="btn-primary">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {importing ? 'Importing...' : 'Upload and Import'}
                </button>
                <button type="button" onClick={closeImportPanel} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-slate-950">Expected format</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Columns must include name, email, and role. Password is optional and defaults to password.
                  </p>
                </div>
                <button type="button" onClick={downloadSampleCsv} className="btn-secondary">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Sample
                </button>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                {sampleCsv}
              </pre>
            </div>
          </div>
        </SectionCard>
      )}

      {showForm && canCreate && (
        <SectionCard title={editingUser ? 'Edit user' : 'Create user'} description="Role changes apply immediately after saving.">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="name">
                Name
              </label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className="field-input" />
              {fieldErrors.name?.[0] && <p className="field-error">{fieldErrors.name[0]}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="field-input" />
              {fieldErrors.email?.[0] && <p className="field-error">{fieldErrors.email[0]}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="role">
                Role
              </label>
              <select id="role" name="role" value={form.role} onChange={handleChange} className="field-input">
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
              {fieldErrors.role?.[0] && <p className="field-error">{fieldErrors.role[0]}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Password {editingUser ? '(optional)' : ''}
              </label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} className="field-input" />
              {fieldErrors.password?.[0] && <p className="field-error">{fieldErrors.password[0]}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="field-label" htmlFor="password_confirmation">
                Confirm Password
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={handleChange}
                className="field-input"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard
        title="Team directory"
        description={`${filteredUsers.length} of ${users.length} users shown`}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex min-w-64 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400">
              <Search className="h-4 w-4" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users"
                className="ml-2 w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </label>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="field-input sm:w-40">
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          embedded
          emptyState={
            <EmptyState
              icon={users.length ? Search : UserRoundPlus}
              title={users.length ? 'No users match your filters' : 'No users yet'}
              description={users.length ? 'Try a different search term or role filter.' : 'Create your first tenant user and assign the right level of access.'}
              action={
                !users.length &&
                canCreate && (
                  <button type="button" onClick={openCreateForm} className="btn-primary">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add User
                  </button>
                )
              }
            />
          }
        />
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-3">
        {['admin', 'manager', 'viewer'].map((role) => (
          <div key={role} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <RoleBadge role={role} />
              <UsersIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-slate-950">{users.filter((member) => member.role === role).length}</p>
            <p className="mt-1 text-sm text-slate-500">Users with {role} access</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Users
