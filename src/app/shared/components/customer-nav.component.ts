import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-customer-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <header class="customer-nav">
      <div class="nav-container">
        <!-- Logo -->
        <a routerLink="/customer" class="logo">
          <app-icon name="utensils" [size]="24" color="var(--color-primary)"></app-icon>
          <span class="logo-text">Gym<span class="logo-accent">Plate</span></span>
          <span class="portal-badge">Customer</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav-links" [class.mobile-open]="isMobileMenuOpen()">
          <a routerLink="/customer" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">
            <app-icon name="home" [size]="18"></app-icon>
            <span>Home</span>
          </a>
          <a routerLink="/customer/explore" routerLinkActive="active" (click)="closeMobileMenu()">
            <app-icon name="compass" [size]="18"></app-icon>
            <span>Explore Food</span>
          </a>
          <a routerLink="/customer/orders" routerLinkActive="active" (click)="closeMobileMenu()">
            <app-icon name="package" [size]="18"></app-icon>
            <span>My Orders</span>
          </a>
          <a routerLink="/customer/nutrition" routerLinkActive="active" (click)="closeMobileMenu()">
            <app-icon name="activity" [size]="18"></app-icon>
            <span>Nutrition Summary</span>
          </a>

          <!-- Mobile Only User Info -->
          <div class="mobile-user-section" *ngIf="isMobileMenuOpen()">
            <div class="user-info-row">
              <span class="user-name">{{ userName() }}</span>
              <span class="user-email">{{ userEmail() }}</span>
            </div>
            <a routerLink="/customer/profile" class="btn btn-secondary btn-sm" (click)="closeMobileMenu()">
              <app-icon name="user" [size]="16"></app-icon>
              Profile Settings
            </a>
            <button class="btn btn-outline btn-sm" (click)="logout()">
              <app-icon name="log-out" [size]="16"></app-icon>
              Sign Out
            </button>
          </div>
        </nav>

        <!-- Right Side Actions -->
        <div class="nav-actions">
          <!-- Cart -->
          <a routerLink="/customer/cart" class="action-btn cart-btn" title="View Cart">
            <app-icon name="shopping-bag" [size]="20"></app-icon>
            <span class="badge-count" *ngIf="cartCount() > 0">{{ cartCount() }}</span>
          </a>

          <!-- Notifications -->
          <div class="dropdown-wrapper">
            <button class="action-btn" (click)="toggleNotifications()" title="Notifications">
              <app-icon name="bell" [size]="20"></app-icon>
              <span class="badge-dot" *ngIf="unreadNotificationCount() > 0"></span>
            </button>

            <!-- Notifications Dropdown -->
            <div class="dropdown-menu notif-menu" *ngIf="isNotificationOpen()">
              <div class="dropdown-header">
                <span class="font-semibold">Notifications</span>
                <button class="text-xs text-primary mark-btn" *ngIf="unreadNotificationCount() > 0" (click)="markAllRead()">
                  Mark all as read
                </button>
              </div>
              <div class="notif-list">
                <div *ngIf="notifications().length === 0" class="empty-notif">
                  No notifications
                </div>
                <div *ngFor="let n of notifications().slice(0, 5)" class="notif-item" [class.unread]="!n.isRead" (click)="openNotification(n)">
                  <div class="notif-title">{{ n.title }}</div>
                  <div class="notif-msg">{{ n.message }}</div>
                  <div class="notif-time">{{ n.createdAt | date:'shortTime' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- User Profile Dropdown -->
          <div class="dropdown-wrapper desktop-only">
            <button class="user-btn" (click)="toggleUserMenu()">
              <div class="avatar-circle">
                {{ userInitials() }}
              </div>
              <span class="desktop-name">{{ userFirstName() }}</span>
              <app-icon name="chevron-down" [size]="14"></app-icon>
            </button>

            <div class="dropdown-menu user-menu" *ngIf="isUserMenuOpen()">
              <div class="user-menu-header">
                <strong>{{ userName() }}</strong>
                <span class="user-email-small">{{ userEmail() }}</span>
              </div>
              <a routerLink="/customer/profile" class="dropdown-link" (click)="closeUserMenu()">
                <app-icon name="user" [size]="16"></app-icon>
                <span>My Profile</span>
              </a>
              <a routerLink="/customer/orders" class="dropdown-link" (click)="closeUserMenu()">
                <app-icon name="package" [size]="16"></app-icon>
                <span>Order History</span>
              </a>
              <a routerLink="/customer/nutrition" class="dropdown-link" (click)="closeUserMenu()">
                <app-icon name="activity" [size]="16"></app-icon>
                <span>Nutrition Tracker</span>
              </a>
              <div class="divider"></div>
              <button class="dropdown-link logout-btn" (click)="logout()">
                <app-icon name="log-out" [size]="16" color="var(--color-danger)"></app-icon>
                <span class="text-danger">Sign Out</span>
              </button>
            </div>
          </div>

          <!-- Mobile Hamburger -->
          <button class="mobile-toggle" (click)="toggleMobileMenu()" aria-label="Toggle menu">
            <app-icon [name]="isMobileMenuOpen() ? 'x' : 'menu'" [size]="22"></app-icon>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .customer-nav {
      position: sticky;
      top: 0;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      height: var(--nav-height);
      z-index: 200;
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
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-text);
      text-decoration: none;
    }
    .logo-accent {
      color: var(--color-primary);
    }
    .portal-badge {
      font-size: 0.65rem;
      background: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: 600;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-left: 4px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-6);
    }
    .nav-links a {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 500;
      text-decoration: none;
      padding: 6px 10px;
      border-radius: var(--radius);
      transition: all var(--transition-fast);
    }
    .nav-links a:hover {
      color: var(--color-primary);
      background-color: var(--color-bg-secondary);
    }
    .nav-links a.active {
      color: var(--color-primary);
      background-color: var(--color-primary-light);
      font-weight: 600;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .action-btn {
      position: relative;
      background: none;
      border: 1px solid var(--color-border);
      width: 38px;
      height: 38px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text);
      cursor: pointer;
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .action-btn:hover {
      background-color: var(--color-bg-secondary);
      border-color: var(--color-border-hover);
    }
    .badge-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background-color: var(--color-primary);
      color: white;
      font-size: 10px;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .badge-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background-color: var(--color-danger);
      border-radius: 50%;
    }
    .dropdown-wrapper {
      position: relative;
    }
    .user-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: none;
      border: 1px solid var(--color-border);
      padding: 4px 10px 4px 6px;
      border-radius: var(--radius);
      cursor: pointer;
      color: var(--color-text);
      font-size: var(--font-size-sm);
    }
    .avatar-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
    }
    .desktop-name {
      font-weight: 500;
    }
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 300;
      overflow: hidden;
      animation: fadeIn var(--transition-fast);
    }
    .user-menu {
      min-width: 200px;
    }
    .user-menu-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-bg-secondary);
    }
    .user-email-small {
      display: block;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    .dropdown-link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 10px 16px;
      font-size: var(--font-size-sm);
      color: var(--color-text);
      text-decoration: none;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }
    .dropdown-link:hover {
      background-color: var(--color-bg-secondary);
    }
    .divider {
      height: 1px;
      background: var(--color-border);
      margin: 4px 0;
    }
    .notif-menu {
      width: 320px;
    }
    .dropdown-header {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
    }
    .mark-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-primary);
    }
    .notif-list {
      max-height: 280px;
      overflow-y: auto;
    }
    .notif-item {
      padding: 10px 16px;
      border-bottom: 1px solid var(--color-border);
      cursor: pointer;
    }
    .notif-item:hover {
      background-color: var(--color-bg-secondary);
    }
    .notif-item.unread {
      background-color: var(--color-primary-lighter);
    }
    .notif-title {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text);
    }
    .notif-msg {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 2px 0;
    }
    .notif-time {
      font-size: 10px;
      color: var(--color-text-tertiary);
    }
    .empty-notif {
      padding: 20px;
      text-align: center;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    .mobile-toggle {
      display: none;
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      width: 38px;
      height: 38px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text);
    }
    .mobile-user-section {
      display: none;
    }

    @media (max-width: 860px) {
      .mobile-toggle {
        display: flex;
      }
      .desktop-only {
        display: none;
      }
      .nav-links {
        display: none;
        position: absolute;
        top: var(--nav-height);
        left: 0;
        right: 0;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        flex-direction: column;
        padding: var(--space-6);
        gap: var(--space-3);
        box-shadow: var(--shadow-xl);
      }
      .nav-links.mobile-open {
        display: flex;
      }
      .nav-links a {
        width: 100%;
        padding: 10px 14px;
      }
      .mobile-user-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        width: 100%;
        margin-top: var(--space-3);
        padding-top: var(--space-4);
        border-top: 1px solid var(--color-border);
      }
      .user-info-row {
        display: flex;
        flex-direction: column;
      }
      .user-name {
        font-weight: 600;
        font-size: var(--font-size-sm);
      }
      .user-email {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
      }
    }
  `]
})
export class CustomerNavComponent {
  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);
  isNotificationOpen = signal(false);

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  userName(): string {
    const u = this.authService.user();
    return u ? `${u.firstName} ${u.lastName}` : 'Customer';
  }

  userFirstName(): string {
    return this.authService.user()?.firstName || 'Account';
  }

  userEmail(): string {
    return this.authService.user()?.email || '';
  }

  userInitials(): string {
    const u = this.authService.user();
    if (!u) return 'U';
    return `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase();
  }

  cartCount(): number {
    return this.cartService.itemCount();
  }

  notifications() {
    return this.notificationService.getNotifications();
  }

  unreadNotificationCount(): number {
    return this.notificationService.getUnreadCount();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
    this.isUserMenuOpen.set(false);
    this.isNotificationOpen.set(false);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update(v => !v);
    this.isNotificationOpen.set(false);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  toggleNotifications() {
    this.isNotificationOpen.update(v => !v);
    this.isUserMenuOpen.set(false);
  }

  markAllRead() {
    this.notificationService.markAllAsRead();
  }

  openNotification(n: any) {
    this.notificationService.markAsRead(n.id);
    this.isNotificationOpen.set(false);
    if (n.link) {
      this.router.navigateByUrl(n.link);
    }
  }

  logout() {
    this.authService.logout();
  }
}
