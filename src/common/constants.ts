import { PERMISSION_LEVEL } from 'src/auth/dto/create-auth.dto';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const PERMISSIONS_MAP: Record<PERMISSION_LEVEL, string[]> = {
  [PERMISSION_LEVEL.READ_ONLY]: ['read'],
  [PERMISSION_LEVEL.EDITOR]: ['read', 'write', 'update'],
  [PERMISSION_LEVEL.MANAGER]: ['read', 'write', 'update', 'delete'],
  [PERMISSION_LEVEL.USER]: ['read', 'write', 'update', 'delete'],
};

export const METHOD_TO_PERMISSION: Record<string, string> = {
  GET: 'read',
  POST: 'write',
  PUT: 'update',
  DELETE: 'delete',
};
