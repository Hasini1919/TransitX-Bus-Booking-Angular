import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/interceptors/auth.service';
import { LoggerService } from '../../../core/services/Logger.service';
import { OtpModalComponent } from '../otp/otp.component';

const CTX = 'LoginPage';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, OtpModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private logger = inject(LoggerService);
  private router = inject(Router);

  phone     = '';
  phoneError = '';
  apiError  = '';
  loading   = false;
  showOtp   = false;

  onPhoneInput(): void {
    this.phone = this.phone.replace(/\D/g, '');
    this.phoneError = '';
    this.apiError   = '';
  }

  async handleLogin(): Promise<void> {
    if (!this.validatePhone()) return;

    this.loading  = true;
    this.apiError = '';
    this.logger.userAction('Login', 'Login form submitted', { phone: this.phone });

    try {
      await this.auth.login({ phone: this.phone });
      this.showOtp = true;
      this.logger.userAction('Login', 'OTP modal triggered after login');
    } catch (err: any) {
      const msg = err?.error?.message || 'Phone number not registered. Please sign up.';
      this.apiError = msg;
      this.logger.userError('Login', 'Login failed', msg);
    } finally {
      this.loading = false;
    }
  }

  onVerified(): void {
    this.showOtp = false;
    this.logger.userNav('Login', 'Home');
    this.router.navigate(['/home']);
  }

  private validatePhone(): boolean {
    const cleaned = this.phone.trim();
    if (!cleaned) {
      this.phoneError = 'Mobile number is required.';
      return false;
    }
    if (!/^\d{9}$/.test(cleaned)) {
      this.phoneError = 'Enter a valid 9-digit mobile number.';
      return false;
    }
    return true;
  }
}