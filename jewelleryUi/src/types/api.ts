import { User } from ".";

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  success: boolean;
  result: T;
  url?: string;
  data: T;
}

export interface LoginResponse {
  contact: string;
  createdDate: string;
  email: string;
  id: string;
  keycloakId: string;
  role?: string;
  username: string;
}
export interface SendEmailResponse {
  code: number;
  message: string;
  success?: boolean; // optional, if not always present
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  emailStatus: SendEmailResponse | null;
  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; reason?: string }>;
  register: (userData: any) => Promise<boolean>;
  sendEmailConfirmation: (email: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
  updateUser: (user: User) => void;
  initialize: () => Promise<void>;
}

export interface RegisterResponse extends LoginResponse {}

export interface TokenVerificationResponse extends LoginResponse {}