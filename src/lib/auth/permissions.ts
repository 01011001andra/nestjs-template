import { createAccessControl } from 'better-auth/plugins/access';

export const statement = {
  user: ['create', 'read', 'update', 'ban', 'delete'],
  example: ['create', 'read', 'update', 'delete', 'specialCreate'], // ⬅️ resource baru
} as const;

export const ac = createAccessControl(statement);

export const userRole = ac.newRole({
  example: ['read', 'specialCreate'], // user cuma boleh read example
});

export const adminRole = ac.newRole({
  example: ['create', 'read', 'update'], // admin boleh create/update example
});

export const superAdminRole = ac.newRole({
  example: ['create', 'read', 'update', 'delete'], // superAdmin full access
});

export const roles = {
  superAdmin: superAdminRole,
  admin: adminRole,
  user: userRole,
};

export type AppRoleName = keyof typeof roles;
