import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../components/icon.component';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <header class="public-nav">
      <div class="nav-container">
        <!-- GymPlate Logo on Left -->
        <a routerLink="/" (click)="navigateToSection('home', $event)" class="logo" aria-label="GymPlate Home">
          <app-icon name="utensils" [size]="24" color="var(--color-primary)"></app-icon>
          <span class="logo-text">Gym<span class="logo-accent">Plate</span></span>
        </a>

        <!-- Exactly 5 Navigation Items on Right (Desktop) -->
        <div class="nav-right">
          <nav class="nav-links" aria-label="Main public navigation">
            <a
              routerLink="/"
              (click)="navigateToSection('home', $event)"
              class="nav-item"
              [class.active]="activeSection === 'home' && isLandingPage()"
            >
              Home
            </a>
            <a
              routerLink="/"
              [fragment]="'about'"
              (click)="navigateToSection('about', $event)"
              class="nav-item"
              [class.active]="activeSection === 'about' && isLandingPage()"
            >
              About
            </a>
            <a
              routerLink="/"
              [fragment]="'faqs'"
              (click)="navigateToSection('faqs', $event)"
              class="nav-item"
              [class.active]="activeSection === 'faqs' && isLandingPage()"
            >
              FAQs
            </a>
          </nav>

          <div class="nav-auth-actions">
            <a routerLink="/auth/login" class="nav-signin-link" routerLinkActive="active-auth">Sign In</a>
            <a routerLink="/auth/register" class="btn btn-primary btn-sm nav-signup-btn" routerLinkActive="active-auth">Sign Up</a>
          </div>

          <!-- Responsive Mobile Collapsible Toggle -->
          <button
            class="menu-toggle"
            (click)="toggleMenu()"
            [attr.aria-expanded]="isMenuOpen"
            aria-label="Toggle navigation menu"
          >
            <app-icon [name]="isMenuOpen ? 'x' : 'menu'" [size]="24"></app-icon>
          </button>
        </div>
      </div>

      <!-- Responsive Mobile Collapsible Menu -->
      <div class="mobile-drawer" *ngIf="isMenuOpen">
        <nav class="mobile-nav-list">
          <a
            routerLink="/"
            (click)="navigateToSection('home', $event); closeMenu()"
            class="mobile-nav-item"
            [class.active]="activeSection === 'home' && isLandingPage()"
          >
            <app-icon name="home" [size]="18"></app-icon>
            <span>Home</span>
          </a>
          <a
            routerLink="/"
            [fragment]="'about'"
            (click)="navigateToSection('about', $event); closeMenu()"
            class="mobile-nav-item"
            [class.active]="activeSection === 'about' && isLandingPage()"
          >
            <app-icon name="info" [size]="18"></app-icon>
            <span>About</span>
          </a>
          <a
            routerLink="/"
            [fragment]="'faqs'"
            (click)="navigateToSection('faqs', $event); closeMenu()"
            class="mobile-nav-item"
            [class.active]="activeSection === 'faqs' && isLandingPage()"
          >
            <app-icon name="help-circle" [size]="18"></app-icon>
            <span>FAQs</span>
          </a>

          <div class="mobile-auth-divider"></div>

          <a routerLink="/auth/login" (click)="closeMenu()" class="mobile-signin-btn">
            Sign In
          </a>
          <a routerLink="/auth/register" (click)="closeMenu()" class="btn btn-primary mobile-signup-btn">
            Sign Up
          </a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .public-nav {
      position: sticky;
      top: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--color-border);
      z-index: 100;
      height: var(--nav-height);
    }
    .nav-container {
      max-width: var(--container-max);
      margin: 0 auto;
      padding: 0 var(--space-6);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text);
      text-decoration: none;
      user-select: none;
    }
    .logo-accent {
      color: var(--color-primary);
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: var(--space-8);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-8);
    }
    .nav-item {
      color: var(--color-text-secondary);
      font-weight: 500;
      font-size: var(--font-size-sm);
      text-decoration: none;
      transition: color var(--transition-fast);
      position: relative;
      padding: var(--space-1) 0;
    }
    .nav-item:hover {
      color: var(--color-primary);
    }
    .nav-item.active {
      color: var(--color-primary);
      font-weight: 600;
    }
    .nav-item.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--color-primary);
      border-radius: var(--radius-full);
    }
    .nav-auth-actions {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding-left: var(--space-4);
      border-left: 1px solid var(--color-border);
    }
    .nav-signin-link {
      color: var(--color-text);
      font-weight: 500;
      font-size: var(--font-size-sm);
      text-decoration: none;
      padding: 6px 14px;
      border-radius: var(--radius);
      transition: background-color var(--transition-fast), color var(--transition-fast);
    }
    .nav-signin-link:hover {
      color: var(--color-primary);
      background-color: var(--color-bg-tertiary);
    }
    .nav-signup-btn {
      padding: 7px 18px;
      font-weight: 600;
      border-radius: var(--radius);
      box-shadow: 0 1px 2px rgba(45, 90, 61, 0.2);
    }
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text);
      padding: var(--space-2);
      border-radius: var(--radius);
      line-height: 0;
      transition: background-color var(--transition-fast);
    }
    .menu-toggle:hover {
      background-color: var(--color-bg-tertiary);
    }

    /* Mobile Drawer */
    .mobile-drawer {
      display: none;
      position: absolute;
      top: var(--nav-height);
      left: 0;
      right: 0;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);
      padding: var(--space-6);
      animation: slideDown 180ms ease-out forwards;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .mobile-nav-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      color: var(--color-text);
      font-size: var(--font-size-base);
      font-weight: 500;
      text-decoration: none;
      border-radius: var(--radius);
      transition: background-color var(--transition-fast), color var(--transition-fast);
    }
    .mobile-nav-item:hover, .mobile-nav-item.active {
      background-color: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: 600;
    }
    .mobile-auth-divider {
      height: 1px;
      background-color: var(--color-border);
      margin: var(--space-3) 0;
    }
    .mobile-signin-btn {
      display: block;
      text-align: center;
      padding: var(--space-3);
      color: var(--color-text);
      font-weight: 600;
      text-decoration: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      margin-bottom: var(--space-2);
      transition: background-color var(--transition-fast);
    }
    .mobile-signin-btn:hover {
      background-color: var(--color-bg-secondary);
    }
    .mobile-signup-btn {
      display: block;
      text-align: center;
      padding: var(--space-3);
      font-weight: 600;
      border-radius: var(--radius);
      text-decoration: none;
    }

    @media (max-width: 860px) {
      .nav-links, .nav-auth-actions {
        display: none;
      }
      .menu-toggle {
        display: block;
      }
      .mobile-drawer {
        display: block;
      }
    }
  `]
})
export class PublicNavComponent {
  private router = inject(Router);

  isMenuOpen = false;
  activeSection = 'home';

  isLandingPage(): boolean {
    const url = this.router.url.split('#')[0].split('?')[0];
    return url === '' || url === '/';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  navigateToSection(sectionId: string, event: Event): void {
    this.activeSection = sectionId;

    if (this.isLandingPage()) {
      event.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.history.replaceState(null, '', sectionId === 'home' ? '/' : `#${sectionId}`);
    } else {
      this.router.navigate(['/'], { fragment: sectionId === 'home' ? undefined : sectionId });
    }
  }
}
