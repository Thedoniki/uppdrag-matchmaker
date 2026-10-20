export function canManageAssignments(roles: readonly string[]) {
  return roles.includes("admin");
}