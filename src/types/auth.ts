export interface LoginRequest {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  roleName: string;
  status: string;
  emailVerified: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
  message?: string;
}
