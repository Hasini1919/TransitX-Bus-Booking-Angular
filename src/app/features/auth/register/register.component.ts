import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/interceptors/auth.service';
import { LoggerService } from '../../../core/services/Logger.service';
import { OtpModalComponent } from '../otp/otp.component';
import { RoleOption } from '../../../models/auth.model';
import { ChangeDetectorRef } from '@angular/core';

const CTX = 'RegisterPage';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, OtpModalComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private logger = inject(LoggerService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  form = { username: '', phone: '', email: '', role: '' };
  errors: Record<string, string> = {};
  apiError = '';
  loading = false;
  showOtp = false;

  steps = ['Fill in your details', 'Verify your number', 'Start exploring'];

  toast: { type: 'success' | 'error' | ''; message: string } = { type: '', message: '' };

  roles: RoleOption[] = [
    { value: 'travel', label: 'Travel', enabled: true },
    { value: 'driver', label: 'Driver', enabled: false },
    { value: 'passenger', label: 'Passenger', enabled: false },
  ];

  onPhoneInput(): void {
    this.form.phone = this.form.phone.replace(/\D/g, '');
    this.clearError('phone');
  }

  clearError(field: string): void {
    delete this.errors[field];
    this.apiError = '';
  }

  async handleRegister(): Promise<void> {
    if (!this.validate()) return;

    this.loading = true;
    this.apiError = '';

    this.logger.userAction('Register', 'Register form submitted', {
      phone: this.form.phone,
      role: this.form.role,
    });

    try {
      await this.auth.register({
        username: this.form.username.trim(),
        phone: this.form.phone.trim(),
        email: this.form.email.trim(),
        role: this.form.role,
      });

      this.logger.devInfo(CTX, 'OTP sent successfully');
      this.loading = false;
      this.showToast('success', 'OTP sent! Check your mobile to verify.');
      this.cdr.detectChanges();

      setTimeout(() => {
        this.showOtp = true;
        this.cdr.detectChanges();
      }, 1800);
    } catch (err: any) {
      const msg = err?.error?.message || 'Registration failed. Please try again.';
      this.loading = false;
      this.showToast('error', msg);
      this.cdr.detectChanges();
      this.logger.userError('Register', 'Registration API error', msg);
    }
  }

  showToast(type: 'success' | 'error', message: string) {
    this.toast = { type, message };
    setTimeout(() => this.toast = { type: '', message: '' }, 4000);
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
    this.logger.userNav('Register', 'Home');
    this.router.navigate(['/home']);
  }

  private validate(): boolean {
    this.errors = {};
    const f = this.form;

    if (!f.username.trim()) this.errors['username'] = 'Full name is required.';
    if (!f.phone.trim()) this.errors['phone'] = 'Mobile number is required.';
    else if (!/^\d{9}$/.test(f.phone)) this.errors['phone'] = 'Enter a valid 9-digit number.';
    if (!f.email.trim()) this.errors['email'] = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(f.email)) this.errors['email'] = 'Enter a valid email address.';
    if (!f.role) this.errors['role'] = 'Please select a role.';

    const valid = Object.keys(this.errors).length === 0;
    if (!valid) this.logger.devWarn('Register', 'Form validation failed', this.errors);
    return valid;
  }
}
