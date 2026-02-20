export interface CreateUserParams {
  email: string;
  passwordHash: string;
  displayName: string;
  role?: 'USER' | 'ADMIN';
  privacyAcceptedAt?: Date | null;
  privacyPolicyVersion?: string | null;
}
