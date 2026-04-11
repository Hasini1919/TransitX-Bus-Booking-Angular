import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggerService } from '../services/Logger.service';

const CTX = 'HttpInterceptor';

export const httpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const logger = inject(LoggerService);

  const cloned = req.clone({
    setHeaders: { 'Content-Type': 'application/json' }
  });

  logger.devDebug(CTX, `→ ${req.method} ${req.url}`);

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      logger.devError(CTX, `✗ ${req.method} ${req.url} — ${error.status}`, error.message);
      return throwError(() => error);
    })
  );
};
