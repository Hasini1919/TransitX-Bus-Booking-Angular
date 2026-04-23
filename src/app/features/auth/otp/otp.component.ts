import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/interceptors/auth.service';
import { LoggerService } from '../../../core/services/Logger.service';

const CTX = 'OtpModalComponent';

@Component({
  selector: 'app-otp-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpModalComponent implements OnInit, OnDestroy {
  @Input()  phone = '';
  @Output() verified = new EventEmitter<void>();
  @Output() closed   = new EventEmitter<void>();

  private auth   = inject(AuthService);
  private logger = inject(LoggerService);

  digits: string[] = ['', '', '', '', ''];
  loading  = false;
  resending = false;
  hasError  = false;
  errorMessage  = '';
  successMessage = '';
  countdown = 60;
  private timer?: ReturnType<typeof setInterval>;

  get otpCode(): string { return this.digits.join(''); }

  ngOnInit(): void {
    this.logger.devInfo(CTX, 'OTP modal initialized');
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  onInput(event: Event, idx: number): void {
    const input = event.target as HTMLInputElement;
    const val   = input.value.replace(/\D/g, '');
    this.digits[idx] = val.slice(-1);
    this.hasError = false;

    if (val && idx < 4) {
      const next = document.getElementById(`otp-${idx + 1}`) as HTMLInputElement;
      next?.focus();
    }
    this.logger.devDebug(CTX, `Digit ${idx} entered`);
  }

  onKeydown(event: KeyboardEvent, idx: number): void {
    if (event.key === 'Backspace' && !this.digits[idx] && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`) as HTMLInputElement;
      prev?.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';
    const nums = text.replace(/\D/g, '').slice(0, 5).split('');
    nums.forEach((digit, index) => { this.digits[index] = digit; });
    event.preventDefault();
    const nextEmpty = this.digits.findIndex(d => !d);
    const focusIdx  = nextEmpty === -1 ? 4 : nextEmpty;
    const el = document.getElementById(`otp-${focusIdx}`) as HTMLInputElement;
    el?.focus();
    this.logger.devDebug(CTX, 'OTP pasted');
  }

  async verify(): Promise<void> {
    if (this.otpCode.length < 5) return;
    this.loading  = true;
    this.hasError = false;
    this.errorMessage  = '';
    this.successMessage = '';

    try {
      this.logger.devInfo(CTX, 'Verifying OTP', { phone: this.phone, code: this.otpCode });  
      await this.auth.verifyOtp({ phone: this.phone, code: this.otpCode });
      this.auth.saveSession(this.phone);
      this.successMessage = '✓ Verified! Redirecting...';
      this.logger.userAction('OTP', 'OTP verified — session saved', { phone: this.phone });

      setTimeout(() => { this.successMessage = 'OTP verified successfully!';
        this.verified.emit(); }, 800);
    } catch (err: any) {
      this.hasError     = true;
      this.errorMessage = err?.error?.message || 'Invalid OTP. Please try again.';
      this.digits       = ['', '', '', '', ''];
      this.logger.userError('OTP', 'Incorrect OTP entered');
      document.getElementById('otp-0')?.focus();
    } finally {
      this.loading = false;
    }
  }

  async resend(): Promise<void> {
    this.resending = true;
    this.hasError  = false;
    this.errorMessage = '';
    this.logger.userAction('OTP', 'User requested OTP resend', { phone: this.phone });

    try {
      await this.auth.sendOtp({ phone: this.phone });
      this.successMessage = '✓ New OTP sent!';
      this.digits = ['', '', '', '', ''];
      this.countdown = 60;
      this.startCountdown();
      document.getElementById('otp-0')?.focus();
    } catch (err: any) {
      this.hasError     = true;
      this.errorMessage = err?.error?.message || 'Failed to resend OTP.';
      this.logger.userError('OTP', 'Resend OTP failed');
    } finally {
      this.resending = false;
    }
  }

  close(): void {
    this.logger.userAction('OTP', 'User dismissed OTP modal');
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('otp-backdrop')) {
      this.close();
    }
  }

  private startCountdown(): void {
    this.clearTimer();
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.countdown = 0;
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timer) { clearInterval(this.timer); }
  }
}