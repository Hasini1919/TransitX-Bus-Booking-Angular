import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/interceptors/auth.service';
import { LoggerService } from '../../core/services/Logger.service';

const CTX = 'HomePage';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-root">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="brand">
          <div class="brand-logo">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="rgba(255,107,0,0.12)"/>
              <path d="M20 8 L30 28 L20 24 L10 28 Z" fill="#FF6B00"/>
            </svg>
          </div>
          <span class="brand-name">TravelGo</span>
        </div>
        <div class="nav-actions">
          <span class="user-phone">{{ phone }}</span>
          <button class="btn-logout" (click)="logout()">Sign Out</button>
        </div>
      </nav>

      <!-- Hero -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-tag">Welcome back 👋</div>
          <h1>Where are you<br>headed today?</h1>
          <p>Your travel dashboard is ready. Explore routes, track journeys, and more.</p>
          <div class="hero-cta">
            <button class="btn-explore">Explore Rides</button>
            <button class="btn-secondary">View History</button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="map-card">
            <div class="map-pin pin-a">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div class="map-pin pin-b">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div class="map-route"></div>
            <div class="map-label">Colombo → Kandy</div>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="stats">
        <div class="stat-card" *ngFor="let s of stats">
          <div class="stat-icon" [style.background]="s.bg">
            <span>{{ s.icon }}</span>
          </div>
          <div>
            <div class="stat-val">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

    :host { display: block; min-height: 100vh; background: #fffaf7; }

    /* ── Navbar ── */
    .navbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 48px;
      background: white;
      border-bottom: 1px solid #f0e8de;
      position: sticky; top: 0; z-index: 100;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo { width: 36px; height: 36px; }
    .brand-name {
      font-family: 'Syne', sans-serif;
      font-size: 1.3rem; font-weight: 800;
      color: #1a0a00; letter-spacing: -0.5px;
    }

    .nav-actions { display: flex; align-items: center; gap: 16px; }
    .user-phone { color: #9a7a60; font-size: 0.88rem; }

    .btn-logout {
      padding: 8px 20px;
      border: 2px solid #FF6B00;
      background: transparent; color: #FF6B00;
      border-radius: 8px;
      font-family: 'Syne', sans-serif; font-weight: 700;
      font-size: 0.85rem; cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .btn-logout:hover { background: #FF6B00; color: white; }

    /* ── Hero ── */
    .hero {
      display: flex; align-items: center; justify-content: space-between;
      padding: 80px 48px 60px;
      gap: 48px;
    }

    .hero-content { max-width: 520px; }
    .hero-tag {
      display: inline-block;
      background: #fff0e0;
      color: #FF6B00; font-weight: 700;
      font-size: 0.85rem; padding: 6px 14px;
      border-radius: 20px; margin-bottom: 20px;
      letter-spacing: 0.3px;
    }

    h1 {
      font-family: 'Syne', sans-serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800; color: #1a0a00;
      line-height: 1.05; letter-spacing: -1.5px;
      margin: 0 0 20px;
    }

    .hero-content p {
      font-family: 'DM Sans', sans-serif;
      color: #7a5a40; font-size: 1.05rem;
      line-height: 1.65; margin: 0 0 32px;
    }

    .hero-cta { display: flex; gap: 16px; flex-wrap: wrap; }

    .btn-explore {
      padding: 14px 28px;
      background: linear-gradient(135deg, #FF6B00, #FF9500);
      color: white; border: none; border-radius: 12px;
      font-family: 'Syne', sans-serif; font-size: 0.97rem;
      font-weight: 700; cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 8px 24px rgba(255,107,0,0.35);
    }
    .btn-explore:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255,107,0,0.45); }

    .btn-secondary {
      padding: 14px 28px;
      background: white; color: #1a0a00;
      border: 2px solid #e8ddd4; border-radius: 12px;
      font-family: 'Syne', sans-serif; font-size: 0.97rem;
      font-weight: 700; cursor: pointer;
      transition: border-color 0.2s;
    }
    .btn-secondary:hover { border-color: #FF9500; }

    /* ── Map card ── */
    .hero-visual { flex-shrink: 0; }
    .map-card {
      width: 320px; height: 240px;
      background: linear-gradient(135deg, #1a0a00 0%, #2d1200 100%);
      border-radius: 24px;
      position: relative; overflow: hidden;
      box-shadow: 0 24px 60px rgba(255,107,0,0.25);
    }
    .map-card::before {
      content: '';
      position: absolute; inset: 0;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 40px, rgba(255,107,0,0.04) 40px, rgba(255,107,0,0.04) 41px
      ),
      repeating-linear-gradient(
        90deg, transparent, transparent 40px, rgba(255,107,0,0.04) 40px, rgba(255,107,0,0.04) 41px
      );
    }
    .map-pin {
      position: absolute; color: #FF6B00;
      width: 28px; height: 28px;
      filter: drop-shadow(0 4px 8px rgba(255,107,0,0.5));
    }
    .pin-a { top: 40px; left: 60px; }
    .pin-b { bottom: 50px; right: 60px; color: #FF9500; }

    .map-route {
      position: absolute;
      top: 60px; left: 74px;
      width: 170px; height: 100px;
      border: 2px dashed rgba(255,149,0,0.6);
      border-radius: 0 60px 0 0;
      border-left: none; border-bottom: none;
    }

    .map-label {
      position: absolute; bottom: 20px; left: 50%;
      transform: translateX(-50%);
      background: rgba(255,107,0,0.9);
      color: white; font-family: 'Syne', sans-serif;
      font-size: 0.78rem; font-weight: 700;
      padding: 6px 14px; border-radius: 20px;
      white-space: nowrap; letter-spacing: 0.5px;
    }

    /* ── Stats ── */
    .stats {
      display: flex; gap: 20px;
      padding: 0 48px 60px;
      flex-wrap: wrap;
    }
    .stat-card {
      flex: 1; min-width: 160px;
      background: white;
      border: 1px solid #f0e8de;
      border-radius: 16px;
      padding: 20px 24px;
      display: flex; align-items: center; gap: 16px;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .stat-card:hover {
      box-shadow: 0 8px 24px rgba(255,107,0,0.12);
      transform: translateY(-2px);
    }
    .stat-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; flex-shrink: 0;
    }
    .stat-val {
      font-family: 'Syne', sans-serif;
      font-size: 1.5rem; font-weight: 800;
      color: #1a0a00; line-height: 1;
    }
    .stat-label {
      font-size: 0.82rem; color: #9a7a60;
      margin-top: 4px;
    }

    @media (max-width: 900px) {
      .hero { flex-direction: column; padding: 48px 24px 40px; }
      .hero-visual { display: none; }
      .stats { padding: 0 24px 40px; }
      .navbar { padding: 16px 24px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private auth   = inject(AuthService);
  private logger = inject(LoggerService);
  private router = inject(Router);

  phone = '';

  stats = [
    { icon: '🚗', label: 'Total Rides',    value: '0',    bg: '#fff0e0' },
    { icon: '📍', label: 'Routes Saved',   value: '0',    bg: '#e8f5e9' },
    { icon: '⭐', label: 'Avg Rating',      value: '—',    bg: '#fff3e0' },
    { icon: '💰', label: 'Total Spent',    value: 'LKR 0', bg: '#fce4ec' }
  ];

  ngOnInit(): void {
    this.phone = this.auth.getSession() || '';
    this.logger.devInfo('HomePage', 'Home page loaded', { phone: this.phone });
    this.logger.userAction('HomePage', 'User arrived at home page', { phone: this.phone });
  }

  logout(): void {
    this.logger.userAction('HomePage', 'User signed out', { phone: this.phone });
    this.auth.clearSession();
    this.router.navigate(['/login']);
  }
}
