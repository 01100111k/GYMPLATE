import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SellerService } from '../../services/seller.service';
import { NotificationService } from '../../services/notification.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-seller-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <!-- Mobile Header Bar -->
    <header class="mobile-header">
      <button class="menu-btn" (click)="toggleMobileDrawer()" aria-label="Toggle Navigation">
        <app-icon name="menu" [size]="22"></app-icon>
      </button>
      <div class="mobile-brand">
        <span class="logo-text">Gym<span class="logo-accent">Plate</span></span>
        <span class="role-pill">Seller</span>
      </div>
      <a routerLink="/seller/notifications" class="mobile-notif-btn">
        <app-icon name="bell" [size]="20"></app-icon>
        <span class="badge-dot" *ngIf="unreadCount() > 0"></span>
      </a>
    </header>

    <!-- Backdrop for mobile drawer -->
    <div class="drawer-backdrop" *ngIf="isMobileDrawerOpen()" (click)="closeMobileDrawer()"></div>

    <!-- Main Sidebar Container -->
    <aside class="sidebar" [class.collapsed]="isCollapsed()" [class.mobile-open]="isMobileDrawerOpen()">
      <!-- Brand & Collapse Toggle -->
      <div class="sidebar-header">
        <div class="brand-group" *ngIf="!isCollapsed()">
          <app-icon name="utensils" [size]="22" color="var(--color-primary)"></app-icon>
          <span class="logo-text">Gym<span class="logo-accent">Plate</span></span>
        </div>
        <div class="collapsed-logo" *ngIf="isCollapsed()">
          <app-icon name="utensils" [size]="22" color="var(--color-primary)"></app-icon>
        </div>
        <button class="collapse-toggle desktop-only" (click)="toggleCollapse()" [title]="isCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'">
          <app-icon [name]="isCollapsed() ? 'chevron-right' : 'chevron-left'" [size]="16"></app-icon>
        </button>
        <button class="close-drawer mobile-only" (click)="closeMobileDrawer()">
          <app-icon name="x" [size]="20"></app-icon>
        </button>
      </div>

      <!-- Business & Verification Status Badge -->
      <div class="business-badge-section" *ngIf="!isCollapsed()">
        <div class="biz-info">
          <span class="biz-name">{{ businessName() }}</span>
          <span class="status-chip" [ngClass]="'status-' + sellerStatus()">
            {{ formatStatus(sellerStatus()) }}
          </span>
        </div>
        <div *ngIf="sellerStatus() !== 'approved'" class="status-alert">
          <small *ngIf="sellerStatus() === 'pending'">Application under review. Product creation locked.</small>
          <small *ngIf="sellerStatus() === 'rejected'">Application rejected. Click to review reason.</small>
          <small *ngIf="sellerStatus() === 'info_required'">Additional info requested by Admin.</small>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <div class="nav-section-title" *ngIf="!isCollapsed()">Store Management</div>

        <a routerLink="/seller" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Dashboard'">
          <app-icon name="layout-dashboard" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Dashboard</span>
        </a>

        <a routerLink="/seller/products" [class.active]="isProductsActive()" (click)="closeMobileDrawer()" [title]="'My Products'">
          <app-icon name="package" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">My Products</span>
        </a>

        <a routerLink="/seller/products/add" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Add Product'" [class.disabled-link]="sellerStatus() !== 'approved'">
          <app-icon name="plus-circle" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Add Product</span>
        </a>

        <a routerLink="/seller/orders" routerLinkActive="active" (click)="closeMobileDrawer()" [title]="'Orders'">
          <app-icon name="clipboard-list" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Orders</span>
        </a>

        <a routerLink="/seller/inventory" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Inventory'">
          <app-icon name="box" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Inventory</span>
        </a>

        <div class="nav-section-title" *ngIf="!isCollapsed()">Analytics & Performance</div>

        <a routerLink="/seller/reports" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Sales & Reports'">
          <app-icon name="bar-chart-2" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Sales & Reports</span>
        </a>

        <a routerLink="/seller/reviews" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Customer Reviews'">
          <app-icon name="star" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Customer Reviews</span>
        </a>

        <a routerLink="/seller/customer-reports" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Customer Reports'">
          <app-icon name="alert-triangle" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Customer Reports</span>
        </a>

        <div class="nav-section-title" *ngIf="!isCollapsed()">Account & Store</div>

        <a routerLink="/seller/business" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Business Profile'">
          <app-icon name="store" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Business Profile</span>
        </a>

        <a routerLink="/seller/notifications" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Notifications'">
          <div class="icon-with-badge">
            <app-icon name="bell" [size]="18"></app-icon>
            <span class="sub-badge" *ngIf="unreadCount() > 0 && isCollapsed()">{{ unreadCount() }}</span>
          </div>
          <span class="link-label" *ngIf="!isCollapsed()">Notifications</span>
          <span class="count-pill" *ngIf="!isCollapsed() && unreadCount() > 0">{{ unreadCount() }}</span>
        </a>

        <a routerLink="/seller/settings" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Settings'">
          <app-icon name="settings" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Settings</span>
        </a>

        <a *ngIf="sellerStatus() !== 'approved'" routerLink="/seller/pending" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileDrawer()" [title]="'Application Status'" class="highlight-link">
          <app-icon name="alert-circle" [size]="18"></app-icon>
          <span class="link-label" *ngIf="!isCollapsed()">Application Status</span>
        </a>
      </nav>

      <!-- Sidebar Footer User / Logout -->
      <div class="sidebar-footer">
        <div class="user-block" *ngIf="!isCollapsed()">
          <div class="user-meta">
            <div class="user-name">{{ userName() }}</div>
            <div class="user-role-label">Seller Portal</div>
          </div>
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
    .menu-btn, .mobile-notif-btn {
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
      position: relative;
    }
    .mobile-brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 700;
      font-size: var(--font-size-base);
    }
    .role-pill {
      font-size: 10px;
      padding: 2px 6px;
      background: var(--color-primary-light);
      color: var(--color-primary);
      border-radius: var(--radius-sm);
      font-weight: 600;
    }
    .badge-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-danger);
    }

    /* Drawer Backdrop */
    .drawer-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 250;
      animation: fadeIn var(--transition-fast);
    }

    /* Main Sidebar */
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
      font-size: var(--font-size-lg);
    }
    .logo-text {
      color: var(--color-text);
    }
    .logo-accent {
      color: var(--color-primary);
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
      transition: all var(--transition-fast);
    }
    .collapse-toggle:hover {
      background: var(--color-bg-secondary);
      color: var(--color-text);
    }
    .close-drawer {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-secondary);
    }

    .business-badge-section {
      padding: var(--space-3) var(--space-4);
      background: var(--color-bg-secondary);
      border-bottom: 1px solid var(--color-border);
    }
    .biz-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }
    .biz-name {
      font-size: var(--font-size-xs);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .status-chip {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: var(--radius-full);
      text-transform: capitalize;
    }
    .status-approved { background: var(--color-success-bg); color: #166534; }
    .status-pending { background: var(--color-warning-bg); color: #92400E; }
    .status-rejected { background: var(--color-danger-bg); color: #991B1B; }
    .status-info_required { background: var(--color-info-bg); color: #1E40AF; }

    .status-alert {
      margin-top: 6px;
      font-size: 11px;
      color: var(--color-text-secondary);
      line-height: 1.3;
    }

    /* Navigation */
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
      position: relative;
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
    .sidebar-nav a.disabled-link {
      opacity: 0.5;
      pointer-events: none;
    }
    .sidebar-nav a.highlight-link {
      color: var(--color-warning);
    }
    .count-pill {
      margin-left: auto;
      background: var(--color-primary);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: var(--radius-full);
    }
    .icon-with-badge {
      position: relative;
    }
    .sub-badge {
      position: absolute;
      top: -4px;
      right: -6px;
      background: var(--color-primary);
      color: white;
      font-size: 9px;
      font-weight: 700;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Footer */
    .sidebar-footer {
      border-top: 1px solid var(--color-border);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      background: var(--color-bg-secondary);
    }
    .user-block {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 4px 6px;
    }
    .user-name {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text);
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

    /* Responsive Breakpoints */
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
export class SellerSidebarComponent implements OnInit, OnDestroy {
  isCollapsed = signal(false);
  isMobileDrawerOpen = signal(false);

  constructor(
    private authService: AuthService,
    private sellerService: SellerService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.syncLayoutState();
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('seller-sidebar-collapsed');
      document.body.classList.remove('drawer-open');
    }
  }

  isProductsActive(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/seller/products' || url.startsWith('/seller/products/edit');
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
    this.syncLayoutState();
  }

  private syncLayoutState() {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('seller-sidebar-collapsed', this.isCollapsed());
    }
  }

  toggleMobileDrawer() {
    this.isMobileDrawerOpen.update(v => !v);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('drawer-open', this.isMobileDrawerOpen());
    }
  }

  closeMobileDrawer() {
    this.isMobileDrawerOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('drawer-open');
    }
  }

  userName(): string {
    const u = this.authService.user();
    return u ? `${u.firstName} ${u.lastName}` : 'Seller';
  }

  businessName(): string {
    const user = this.authService.user();
    if (!user) return 'Seller Kitchen';
    const biz = this.sellerService.getBusiness(user.id);
    return biz ? biz.businessName : 'Kitchen Portal';
  }

  sellerStatus(): string {
    const user = this.authService.user();
    if (!user) return 'pending';
    const app = this.sellerService.getApplication(user.id);
    return app?.status || 'approved';
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      approved: 'Approved',
      pending: 'Pending Review',
      rejected: 'Rejected',
      info_required: 'Info Needed'
    };
    return map[status] || status;
  }

  unreadCount(): number {
    return this.notificationService.getUnreadCount();
  }

  logout() {
    this.authService.logout();
  }
}
