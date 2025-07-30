import BaseService from './baseService';
import { ApiResponse } from '../types/api';

interface ResetPasswordRequest {
  email: string;
}

interface UpdatePasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

class PasswordService extends BaseService {
  async resetPassword(email: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/auth/resetPassword?email=${encodeURIComponent(email)}`, {}, false);
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<ApiResponse<any>> {
    return this.post<any>('/auth/updatePassword', data, false);
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<any>> {
    return this.post<any>('/change-password', data, true);
  }
}

export const passwordService = new PasswordService();