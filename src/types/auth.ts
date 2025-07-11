export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
}

export interface MagicLinkVerification {
  token: string;
  email: string;
}