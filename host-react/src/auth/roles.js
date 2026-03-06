export const ROLES = {
  ADMIN:     'admin',
  DEVELOPER: 'developer',
  VIEWER:    'viewer',
}

export const ROLE_CAPS = {
  admin:     { canWrite: true,  canDeploy: true,  canViewMetrics: true,  canManageUsers: true  },
  developer: { canWrite: true,  canDeploy: false, canViewMetrics: true,  canManageUsers: false },
  viewer:    { canWrite: false, canDeploy: false, canViewMetrics: true,  canManageUsers: false },
}

export function getCaps(role) {
  return ROLE_CAPS[role] ?? ROLE_CAPS.viewer
}
