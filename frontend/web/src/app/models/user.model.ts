export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}
