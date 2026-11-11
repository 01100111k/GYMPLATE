import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { MockDataService } from '../../services/mock-data.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <!-- Mobile Header -->
    <header class="mobile-header">
      <button class="menu-btn" (click)="toggleMobileDrawer()" aria-label="Toggle Navigation">
        <app-icon name="menu" [size]="22"></app-icon>
      </button>
      <div class="mobile-brand">
        <span class="logo-text">Gym<span class="logo-accent">Plate</span></span>
        <span class="admin-pill">Admin</span>
      </div>
      <div class="header-placeholder"></div>
    </header>

    <!-- Backdrop for mobile drawer -->
    <div class="drawer-backdrop" *ngIf="isMobileDrawerOpen()" (click)="closeMobileDrawer()"></div>

    <!-- Sidebar -->
    <aside class="sidebar" [class.collapsed]="isCollapsed()" [class.mobile-open]="isMobileDrawerOpen()">
      <!-- Brand & Collapse Toggle -->
      <div class="sidebar-header">
        <div class="brand-group" *ngIf="!isCollapsed()">
          <app-icon name="shield" [size]="22" color="var(--color-primary)"></app-icon>
          <span class="logo-text">Gym<span class="logo-accent">Plate</span></span>
          <span class="admin-tag">Admin</span>
        </div>
        <div class="collapsed-logo" *ngIf="isCollapsed()">
          <app-icon name="shield" [size]="22" color="var(--color-primary)"></app-icon>
        </div>
        <button class="collapse-toggle desktop-only" (click)="toggleCollapse()" [title]="isCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'">
          <app-icon [name]="isCollapsed() ? 'chevron-right' : 'chevron-left'" [size]="16"></app-icon>
        </button>
        <button class="close-drawer mobile-only" (click)="closeMobileDrawer()">
          <app-icon name="x" [size]="20"></app-icon>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <div class="nav-section-title" *ngIf="!isCollapsed()">Overview</div>

        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Dashboard'">
          <app-icon name="layout-dashboard" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Dashboard</span>
        </a>

        <div class="nav-section-title" *ngIf="!isCollapsed()">Verification & Approvals</div>

        <a routerLink="/admin/applications" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'Seller Applications'">
          <div class="icon-with-badge">
            <app-icon name="file-text" [size]="18"></app-icon>
            <span class="sub-badge" *ngIf="pendingApplicationsCount() > 0 && isCollapsed()">{{ pendingApplicationsCount() }}</span>
          </div>
          <span class="link-label" *ngIf="!isCollapsed()">Seller Applications</span>
          <span class="count-pill warning-pill" *ngIf="!isCollapsed() && pendingApplicationsCount() > 0">{{ pendingApplicationsCount() }}</span>
        </a>

        <div class="nav-section-title" *ngIf="!isCollapsed()">Platform Management</div>

        <a routerLink="/admin/sellers" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'Sellers'">
          <app-icon name="store" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Sellers</span>
        </a>

        <a routerLink="/admin/customers" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'Customers'">
          <app-icon name="users" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Customers</span>
        </a>

        <a routerLink="/admin/products" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'Products Moderation'">
          <app-icon name="package" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Products</span>
        </a>

        <a routerLink="/admin/orders" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'Platform Orders'">
          <app-icon name="clipboard-list" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Orders</span>
        </a>

        <a routerLink="/admin/categories" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'Food Categories'">
          <app-icon name="tag" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Categories</span>
        </a>

        <a routerLink="/admin/food-reports" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'Food & Order Reports'">
          <app-icon name="alert-triangle" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Food Reports</span>
        </a>

        <div class="nav-section-title" *ngIf="!isCollapsed()">Insights & Security</div>

        <a routerLink="/admin/reports" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'Reports & Analytics'">
          <app-icon name="bar-chart-2" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Reports & Analytics</span>
        </a>

        <a routerLink="/admin/activity-logs" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'Activity Logs'">
          <app-icon name="activity" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Activity Logs</span>
        </a>

        <a routerLink="/admin/settings" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'System Settings'">
          <app-icon name="settings" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Settings</span>
        </a>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="user-block" *ngIf="!isCollapsed()">
          <div class="user-name">{{ userName() }}</div>
          <div class="user-role-label">System Administrator</div>
        </div>
        <button class="logout-btn" (click)="logout()" [title]="'Sign Out'">
          <app-icon name="log-out" [size]="18"></app-icon>
          <span *ngIf="!isCollapsed()">Sign Out</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Mobile Header */
    .mobile-header {
      display: none;
      height: var(--nav-height);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      padding: 0 var(--space-4);
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 150;
    }
    .menu-btn {
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text);
      cursor: pointer;
    }
    .mobile-brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 700;
    }
    .admin-pill {
      font-size: 10px;
      padding: 2px 6px;
      background: #FEF3C7;
      color: #92400E;
      border-radius: var(--radius-sm);
      font-weight: 700;
      text-transform: uppercase;
    }
    .header-placeholder {
      width: 36px;
    }

    .drawer-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 250;
    }

    /* Sidebar */
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      z-index: 200;
      transition: width var(--transition);
      overflow-x: hidden;
    }
    .sidebar.collapsed {
      width: var(--sidebar-collapsed);
    }

    .sidebar-header {
      height: var(--nav-height);
      padding: 0 var(--space-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 700;
      font-size: var(--font-size-base);
    }
    .logo-text {
      color: var(--color-text);
    }
    .logo-accent {
      color: var(--color-primary);
    }
    .admin-tag {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      background: #FEF3C7;
      color: #92400E;
      padding: 2px 5px;
      border-radius: var(--radius-sm);
      letter-spacing: 0.05em;
    }
    .collapsed-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .collapse-toggle {
      background: none;
      border: 1px solid var(--color-border);
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-secondary);
    }
    .close-drawer {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-secondary);
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-3) var(--space-2);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav-section-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-tertiary);
      font-weight: 600;
      padding: var(--space-3) var(--space-3) var(--space-1);
    }
    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 10px;
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: 13px;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    .sidebar.collapsed .sidebar-nav a {
      justify-content: center;
      padding: 8px 0;
    }
    .sidebar-nav a:hover {
      background-color: var(--color-bg-secondary);
      color: var(--color-text);
    }
    .sidebar-nav a.active {
      background-color: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: 600;
    }

    .count-pill {
      margin-left: auto;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: var(--radius-full);
    }
    .warning-pill {
      background: var(--color-warning);
      color: #78350F;
    }
    .icon-with-badge {
      position: relative;
    }
    .sub-badge {
      position: absolute;
      top: -4px;
      right: -6px;
      background: var(--color-warning);
      color: #78350F;
      font-size: 9px;
      font-weight: 700;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sidebar-footer {
      border-top: 1px solid var(--color-border);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      background: var(--color-bg-secondary);
    }
    .user-block {
      padding: 4px 6px;
    }
    .user-name {
      font-size: var(--font-size-xs);
      font-weight: 600;
    }
    .user-role-label {
      font-size: 10px;
      color: var(--color-text-secondary);
    }
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: 1px solid var(--color-border);
      padding: 5px 10px;
      height: 30px;
      border-radius: var(--radius-sm);
      color: var(--color-danger);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .sidebar.collapsed .logout-btn {
      padding: 5px 0;
      height: 28px;
    }
    .logout-btn:hover {
      background: var(--color-danger-bg);
      border-color: var(--color-danger);
    }

    .desktop-only { display: flex; }
    .mobile-only { display: none; }

    @media (max-width: 900px) {
      .mobile-header {
        display: flex;
        width: 100%;
      }
      .drawer-backdrop {
        display: block;
        z-index: 250;
      }
      .sidebar {
        transform: translateX(-100%);
        transition: transform var(--transition);
        width: 280px !important;
        z-index: 300;
      }
      .sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: var(--shadow-xl);
      }
      .desktop-only { display: none !important; }
      .mobile-only { display: block; }
      .close-drawer { display: block; }
    }
  `]
})
export class AdminSidebarComponent {
  isCollapsed = signal(false);
  isMobileDrawerOpen = signal(false);

  constructor(
    private authService: AuthService,
    private mockData: MockDataService,
    private adminService: AdminService,
    private router: Router
  ) {}

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('admin-sidebar-collapsed', this.isCollapsed());
    }
  }

  toggleMobileDrawer() {
    this.isMobileDrawerOpen.update(v => !v);
  }

  closeMobileDrawer() {
    this.isMobileDrawerOpen.set(false);
  }

  userName(): string {
    const u = this.authService.user();
    return u ? `${u.firstName} ${u.lastName}` : 'Administrator';
  }

  pendingApplicationsCount(): number {
    return this.mockData.getSellerApplications().filter(a => a.status === 'pending').length;
  }

  logout() {
    this.authService.logout();
  }
}
