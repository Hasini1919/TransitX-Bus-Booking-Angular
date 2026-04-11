import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable({ providedIn: 'root' })
export class LoggerService {

  private readonly USER_PREFIX = '[USER]';
  private readonly DEV_PREFIX  = '[DEV]';

  private format(prefix: string, context: string, message: string): string {
    const ts = new Date().toISOString();
    return `${ts} ${prefix} [${context}] ${message}`;
  }

  // ─── Developer Logs ──────────────────────────────────────────────────────────

  devDebug(context: string, message: string, data?: unknown): void {
    console.debug(`%c${this.format(this.DEV_PREFIX, context, message)}`, 'color:#888', data ?? '');
  }

  devInfo(context: string, message: string, data?: unknown): void {
    console.info(`%c${this.format(this.DEV_PREFIX, context, message)}`, 'color:#2196f3', data ?? '');
  }

  devWarn(context: string, message: string, data?: unknown): void {
    console.warn(`%c${this.format(this.DEV_PREFIX, context, message)}`, 'color:#ff9800', data ?? '');
  }

  devError(context: string, message: string, error?: unknown): void {
    console.error(`%c${this.format(this.DEV_PREFIX, context, message)}`, 'color:#f44336', error ?? '');
  }

  // ─── User Activity Logs ───────────────────────────────────────────────────────

  userAction(context: string, action: string, detail?: unknown): void {
    console.log(`%c${this.format(this.USER_PREFIX, context, action)}`, 'color:#4caf50;font-weight:bold', detail ?? '');
  }

  userError(context: string, message: string, detail?: unknown): void {
    console.error(`%c${this.format(this.USER_PREFIX, context, message)}`, 'color:#e91e63', detail ?? '');
  }

  userNav(from: string, to: string): void {
    console.log(`%c${this.format(this.USER_PREFIX, 'NAVIGATION', `${from} → ${to}`)}`, 'color:#9c27b0;font-style:italic');
  }
}
