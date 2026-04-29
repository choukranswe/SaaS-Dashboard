const PERMISSIONS = {
  admin: [
    'dashboard.read',
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'projects.read',
    'projects.create',
    'projects.update',
    'projects.delete',
    'tasks.read',
    'tasks.create',
    'tasks.update',
    'tasks.delete',
  ],
  manager: [
    'dashboard.read',
    'users.read',
    'projects.read',
    'projects.create',
    'projects.update',
    'tasks.read',
    'tasks.create',
    'tasks.update',
  ],
  viewer: [
    'dashboard.read',
    'projects.read',
    'tasks.read',
  ],
}

export const hasPermission = (role, permission) => {
  if (!role || !permission) {
    return false
  }

  return PERMISSIONS[role]?.includes(permission) ?? false
}
