const ROLE_STYLES = {
  admin: 'bg-rose-50 text-rose-700 ring-rose-200',
  manager: 'bg-amber-50 text-amber-700 ring-amber-200',
  viewer: 'bg-sky-50 text-sky-700 ring-sky-200',
}

const RoleBadge = ({ role }) => {
  const normalizedRole = role || 'viewer'
  const label = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)
  const style = ROLE_STYLES[normalizedRole] || ROLE_STYLES.viewer

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  )
}

export default RoleBadge
