export interface TokenPayload {
  sub: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
}
