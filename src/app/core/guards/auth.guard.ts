import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../interceptors/auth.service';
import { LoggerService } from '../services/Logger.service';

export const authGuard: CanActivateFn = (_route, _state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  if (auth.isLoggedIn()) {
    logger.devDebug('AuthGuard', 'Access granted');
    return true;
  }

  logger.devWarn('AuthGuard', 'Unauthenticated — redirecting to login');
  logger.userAction('AuthGuard', 'Redirected to login (not authenticated)');
  router.navigate(['/login']);
  return false;
};
