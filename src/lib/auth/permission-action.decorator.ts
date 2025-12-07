// auth/permission-action.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ACTION_KEY = 'permission_action';

export type PermissionActionName = string; // atau "create" | "read" | ...

export const PermissionAction = (action: PermissionActionName) =>
  SetMetadata(ACTION_KEY, action);
