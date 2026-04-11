export interface RegisterRequest {
    role: string;
    username: string;
    phone: string;
    email: string;
  }
  
  export interface LoginRequest {
    phone: string;
  }
  
  export interface SendOtpRequest {
    phone: string;
  }
  
  export interface VerifyOtpRequest {
    phone: string;
    code: string;
  }
  
  export interface ApiResponse<T = unknown> {
    message?: string;
    data?: T;
    error?: string;
  }
  
  export type UserRole = 'travel' | 'driver' | 'passenger';
  
  export interface RoleOption {
    value: UserRole;
    label: string;
    enabled: boolean;
  }
  