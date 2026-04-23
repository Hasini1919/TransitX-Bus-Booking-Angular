import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/interceptors/auth.service';
import { LoggerService } from '../../../core/services/Logger.service';
import { OtpModalComponent } from '../otp/otp.component';
import { ChangeDetectorRef } from '@angular/core';


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
  private cdr = inject(ChangeDetectorRef);

  phone     = '';
  phoneError = '';
  apiError  = '';
  loading   = false;
  showOtp   = false;

  toast: { type: 'success' | 'error' | ''; message: string } = { type: '', message: '' };

  onPhoneInput(): void {
    this.phone = this.phone.replace(/\D/g, '');
    this.phoneError = '';
    this.apiError   = '';
  }

  async handleLogin(): Promise<void> {
    if (!this.validatePhone()) return;

    this.loading  = true;
    this.apiError = '';

    try {
      await this.auth.login({ phone: this.phone });
      this.logger.devInfo(CTX, 'OTP sent successfully'); 
      this.loading = false;
      this.showToast('success', 'OTP sent! Check your mobile to verify.');
      this.cdr.detectChanges();


      setTimeout(() => {
        this.showOtp = true;
        this.cdr.detectChanges();
      }, 1800);

    } catch (err: any) {
      const msg = err?.error?.message || 'Phone number not registered. Please sign up.';
      this.loading = false;
      this.showToast('error', this.getFriendlyError(msg));
      this.cdr.detectChanges();
      this.logger.userError('Login', 'Login failed', msg);
    } 
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => {
      this.toast = { type: '', message: '' };
      this.cdr.detectChanges();
    }, 4000);
  }

  getFriendlyError(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes('not found') || m.includes('not registered'))
      return 'This number isn\'t registered. Please sign up first.';
    if (m.includes('too many') || m.includes('limit'))
      return 'Too many attempts. Please wait a moment and try again.';
    if (m.includes('invalid') || m.includes('incorrect'))
      return 'Invalid phone number. Please double-check and retry.';
    return 'Something went wrong. Please try again shortly.';
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