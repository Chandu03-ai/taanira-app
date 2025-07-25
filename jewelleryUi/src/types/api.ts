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
  firstname: string;
  id: string;
  keycloakId: string;
  lastname: string;
  role?: string;
  username: string;
}
export interface SendEmailResponse {
  code: number;
  message: string;
  success?: boolean; // optional, if not always present
}
export interface RegisterResponse extends LoginResponse {}

export interface TokenVerificationResponse extends LoginResponse {}