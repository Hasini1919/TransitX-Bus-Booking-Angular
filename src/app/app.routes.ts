import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
//import { OtpComponent } from './features/auth/otp/otp.component';
//import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
 // { path: 'otp', component: OtpComponent },
 // { path: 'login', component: LoginComponent },
];