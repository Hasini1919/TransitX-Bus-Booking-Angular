import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(message: string, data?: any) {
    console.log('[LOG]:', message, data || '');
  }

  error(message: string, error?: any) {
    console.error('[ERROR]:', message, error || '');
  }
}
