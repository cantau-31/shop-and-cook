export interface CreateUserParams {
  email: string;
  passwordHash: string;
  displayName: string;
  role?: 'USER' | 'ADMIN';
}
