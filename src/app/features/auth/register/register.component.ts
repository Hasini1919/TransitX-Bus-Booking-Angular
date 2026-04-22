import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/interceptors/auth.service';
import { LoggerService } from '../../../core/services/Logger.service';
import { OtpModalComponent } from '../otp/otp.component';
import { RoleOption } from '../../../models/auth.model';

const CTX = 'RegisterPage';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, OtpModalComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private logger = inject(LoggerService);
  private router = inject(Router);

  form = { username: '', phone: '', email: '', role: '' };
  errors: Record<string, string> = {};
  apiError = '';
  loading  = false;
  showOtp  = false;

  steps = ['Fill in your details', 'Verify your number', 'Start exploring'];

  roles: RoleOption[] = [
    { value: 'travel',    label: 'Traveller',  enabled: true  },
    { value: 'driver',    label: 'Driver',     enabled: false },
    { value: 'passenger', label: 'Passenger',  enabled: false }
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

    this.loading  = true;
    this.apiError = '';

    this.logger.userAction('Register', 'Register form submitted', { 
     
      phone: this.form.phone, 
      role: this.form.role
     });

    try {
      await this.auth.register({
        username: this.form.username.trim(),
        phone:    this.form.phone.trim(),
        email:    this.form.email.trim(),
        role:     this.form.role
      });

      await this.auth.sendOtp({ phone: this.form.phone });

      this.logger.userAction('Register', 'Registration success — triggering OTP');

      this.logger.devInfo(CTX, 'OTP sent after registration'); 
      this.showOtp = true;

    } catch (err: any) {
      const msg = err?.error?.message || 'Registration failed. Please try again.';
      this.apiError = msg;
      this.logger.userError('Register', 'Registration API error', msg);
    } finally {
      this.loading = false;
    }
  }

  onVerified(): void {
    this.showOtp = false;
    this.logger.userNav('Register', 'Home');
    this.router.navigate(['/home']);
  }

  private validate(): boolean {
    this.errors = {};
    const f = this.form;

    if (!f.username.trim())               this.errors['username'] = 'Full name is required.';
    if (!f.phone.trim())                  this.errors['phone']    = 'Mobile number is required.';
    else if (!/^\d{9}$/.test(f.phone))   this.errors['phone']    = 'Enter a valid 9-digit number.';
    if (!f.email.trim())                  this.errors['email']    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(f.email)) this.errors['email'] = 'Enter a valid email address.';
    if (!f.role)                          this.errors['role']     = 'Please select a role.';

    const valid = Object.keys(this.errors).length === 0;
    if (!valid) this.logger.devWarn('Register', 'Form validation failed', this.errors);
    return valid;
  }
}