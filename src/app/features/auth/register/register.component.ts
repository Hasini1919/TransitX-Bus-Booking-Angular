import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/Logger.service';
import { sriLankanPhoneValidator } from '../../../shared/validators/phone.validator';

@Component({
  selector: 'app-register',
  standalone: true,                   // important for no AppModule
  imports: [ReactiveFormsModule, CommonModule, RouterModule], // import required modules
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private logger: LoggerService
  ) {
    // Initialize form here, after fb is available
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      phone: ['', [Validators.required, sriLankanPhoneValidator]],
      email: ['', [Validators.required, Validators.email]],
      role: ['Travel', Validators.required]
    });
  }

  onSubmit() {
    this.errorMessage = '';

  if(this.registerForm.invalid){

    if (this.registerForm.get('username')?.invalid) {
      this.errorMessage = 'Username is required.';
  } else if (this.registerForm.get('phone')?.invalid) {
      this.errorMessage = 'Valid phone number is required.';
  } else if (this.registerForm.get('email')?.invalid) {
      this.errorMessage = 'Valid email is required.';
  } else if (this.registerForm.get('role')?.invalid) {
      this.errorMessage = 'Role selection is required.';
  }else{
    this.errorMessage = 'Please fill all fields correctly';
  }

  this.logger.error('Form validation failed', this.registerForm.value);

  return;
}

    const { username, phone, email, role } = this.registerForm.value;

    try {
      this.logger.log('Checking username availability...', username);

      this.authService.checkUsernameExists(username).subscribe({
        next: (exists) => {
          if (exists) {
            this.errorMessage = 'Username already exists';
            this.logger.error('Username exists', username);
            return;
          }

          this.logger.log('Registering user...', this.registerForm.value);

          this.authService.register({ username, phone, email, role }).subscribe({
            next: () => {
              this.logger.log('Registration success');
              window.location.href = '/otp'; // navigate to OTP page
            },
            error: (err) => {
              this.errorMessage = 'Registration failed';
              this.logger.error('Registration error', err);
            }
          });
        },
        error: (err) => {
          this.errorMessage = 'Error checking username';
          this.logger.error('Username check failed', err);
        }
      });
    } catch (error) {
      this.errorMessage = 'Unexpected error occurred';
      this.logger.error('Try-catch error', error);
    }
  }
}