import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from '../services/Logger.service';
import {
  RegisterRequest, LoginRequest,
  SendOtpRequest, VerifyOtpRequest, ApiResponse
} from '../../models/auth.model';

const CTX = 'AuthService';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private logger = inject(LoggerService);

  private get base() { return environment.apiUrl; }

  async register(payload: RegisterRequest): Promise<ApiResponse> {
    this.logger.devInfo(CTX, 'register() called', { phone: payload.phone, role: payload.role });
    this.logger.userAction('Register', 'User attempting registration', { phone: payload.phone });

    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.base}/register`, payload)
      );
      this.logger.devInfo(CTX, 'register() success', res);
      this.logger.userAction('Register', 'Registration API success');
      return res;
    } catch (err) {
      const e = err as HttpErrorResponse;
      this.logger.devError(CTX, 'register() failed', e);
      this.logger.userError('Register', 'Registration failed', e?.error?.message);
      throw e;
    }
  }

  async login(payload: LoginRequest): Promise<ApiResponse> {
    this.logger.devInfo(CTX, 'login() called', { phone: payload.phone });
    this.logger.userAction('Login', 'User attempting login', { phone: payload.phone });

    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.base}/login`, payload)
      );
      localStorage.setItem('jwtToken', (res as { token: string }).token);
      this.logger.devInfo(CTX, 'login() success', res);
      this.logger.userAction('Login', 'Login API success — OTP should be sent');
      return res;
    } catch (err) {
      const e = err as HttpErrorResponse;
      this.logger.devError(CTX, 'login() failed', e);
      this.logger.userError('Login', 'Login failed', e?.error?.message);
      throw e;
    }
  }

  async sendOtp(payload: SendOtpRequest): Promise<ApiResponse> {
    this.logger.devInfo(CTX, 'sendOtp() called', { phone: payload.phone });
    this.logger.userAction('OTP', 'Sending OTP to phone', { phone: payload.phone });

    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.base}/send-otp`, payload)
      );
      this.logger.devInfo(CTX, 'sendOtp() success', res);
      this.logger.userAction('OTP', 'OTP sent successfully');
      return res;
    } catch (err) {
      const e = err as HttpErrorResponse;
      this.logger.devError(CTX, 'sendOtp() failed', e);
      this.logger.userError('OTP', 'Failed to send OTP', e?.error?.message);
      throw e;
    }
  }

  async verifyOtp(payload: VerifyOtpRequest): Promise<ApiResponse> {
    this.logger.devInfo(CTX, 'verifyOtp() called', { phone: payload.phone });
    this.logger.userAction('OTP', 'User submitting OTP code');

    try {
      this.logger.devInfo(CTX, 'Attempting to verify OTP', { phone: payload.phone, code: payload.code });
      const res = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.base}/verify`, payload)
      );
      this.logger.devInfo(CTX, 'verifyOtp() success', res);
      this.logger.userAction('OTP', 'OTP verified successfully — user authenticated');
      return res;
    } catch (err) {
      const e = err as HttpErrorResponse;
      this.logger.devError(CTX, 'verifyOtp() failed', e);
      this.logger.userError('OTP', 'OTP verification failed', e?.error?.message);
      throw e;
    }
  }

  saveSession(phone: string): void {
    localStorage.setItem('travel_user_phone', phone);
    this.logger.devDebug(CTX, 'Session saved', { phone });
  }

  getSession(): string | null {
    return localStorage.getItem('travel_user_phone');
  }

  clearSession(): void {
    localStorage.removeItem('travel_user_phone');
    this.logger.devDebug(CTX, 'Session cleared');
  }

  isLoggedIn(): boolean {
    return !!this.getSession();
  }
}
