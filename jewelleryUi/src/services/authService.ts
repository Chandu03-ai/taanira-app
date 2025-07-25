import BaseService from './baseService';
import { API_ENDPOINTS } from '../constants/appConstants';
import { LoginRequest, RegisterRequest } from '../types';
import {
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  SendEmailResponse,
  TokenVerificationResponse,
} from '../types/api';

class AuthService extends BaseService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await this.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
      return response;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await this.post<RegisterResponse>(API_ENDPOINTS.REGISTER, userData);

      // ✅ Call new email endpoint after successful register
      if (response.success && userData.email) {
        try {
          await this.sendRegistrationEmail(userData.email);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }
      }

      return response;
    } catch (error) {
      console.error('Register service error:', error);
      throw error;
    }
  }

        async sendRegistrationEmail(email: string): Promise<SendEmailResponse> {
          const url = API_ENDPOINTS.SEND_EMAIL;

          try {
            const response = await this.post<SendEmailResponse>(url, {
              userName: email.split('@')[0],
              email,
            });
           console.log('✅ Email sent successfully:', response);
            return response.data;
          } catch (error) {
            console.error('❌ sendEmail API error:', error);
            throw error;
          }
        }



  async verifyToken(): Promise<ApiResponse<TokenVerificationResponse>> {
    return this.post<TokenVerificationResponse>(API_ENDPOINTS.VERIFY_TOKEN, true);
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.post<void>(API_ENDPOINTS.LOGOUT, {}, true);
  }
}

export const authService = new AuthService();
