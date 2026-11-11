import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { MockDataService } from '../../services/mock-data.service';
import { ActivityLog, SellerApplication } from '../../models';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminSidebarComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container">
          <!-- Page Header -->
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-warning">Platform Governance</span>
              <h1>Administrator Overview</h1>
              <p class="text-xs text-secondary">Monitor commercial onboarding compliance, marketplace health, and order volumes.</p>
            </div>
            <div class="flex gap-2">
              <a routerLink="/admin/applications" class="btn btn-warning btn-sm">
                <app-icon name="file-text" [size]="14"></app-icon>
                Review Applications ({{ stats.pendingApplications }})
              </a>
              <a routerLink="/admin/reports" class="btn btn-secondary btn-sm">
                <app-icon name="bar-chart-2" [size]="14"></app-icon>
                Platform Reports
              </a>
            </div>
          </div>

          <!-- Pending Applications Alert Banner -->
          <div class="pending-alert card mb-6" *ngIf="stats.pendingApplications > 0">
            <app-icon name="alert-triangle" [size]="20" color="#92400E"></app-icon>
            <div class="flex-1">
              <strong class="text-xs block text-warning font-semibold">
                {{ stats.pendingApplications }} Commercial Kitchen Application(s) Awaiting Compliance Review
              </strong>
              <p class="text-xs text-secondary mt-1">
                Applicants have submitted government identification and health inspection permits.
              </p>
            </div>
            <a routerLink="/admin/applications" class="btn btn-secondary btn-sm">Inspect Queue</a>
          </div>

          <!-- Platform Metric Cards -->
          <div class="grid-4 mb-6">
            <div class="card stat-metric-box">
              <span class="metric-lbl">Total Customers</span>
              <strong class="metric-val">{{ stats.totalCustomers }}</strong>
              <small class="text-tertiary">Active ordering accounts</small>
            </div>

            <div class="card stat-metric-box">
              <span class="metric-lbl">Approved Sellers</span>
              <strong class="metric-val text-success">{{ stats.approvedSellers }}</strong>
              <small class="text-tertiary">{{ stats.totalSellers }} total registered</small>
            </div>

            <div class="card stat-metric-box">
              <span class="metric-lbl">Active Menu Items</span>
              <strong class="metric-val">{{ stats.totalProducts }}</strong>
              <small class="text-tertiary">Dishes across all kitchens</small>
            </div>

            <div class="card stat-metric-box highlight-box">
              <span class="metric-lbl">Gross Order Value</span>
              <strong class="metric-val text-primary">{{ stats.totalOrderValue | currency:'PHP':'symbol' }}</strong>
              <small class="text-secondary">{{ stats.completedOrders }} of {{ stats.totalOrders }} completed</small>
            </div>
          </div>

          <!-- 2 Columns: Pending Queue & Activity Log -->
          <div class="admin-content-grid">
            <!-- Pending Kitchen Applications -->
            <div class="card panel-box">
              <div class="panel-header flex justify-between items-center mb-4">
                <div>
                  <h3>Pending Seller Verification</h3>
                  <p class="text-xs text-secondary">Queue of commercial applicants</p>
                </div>
                <a routerLink="/admin/applications" class="btn btn-ghost btn-sm">All &rarr;</a>
              </div>

              <div class="table-container" *ngIf="pendingApps.length > 0">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Kitchen & Applicant</th>
                      <th>Submitted</th>
                      <th>Documents</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let a of pendingApps">
                      <td>
                        <strong class="text-xs">{{ a.businessInfo.businessName }}</strong>
                        <small class="text-secondary block">{{ a.personalInfo.firstName }} {{ a.personalInfo.lastName }} &bull; {{ a.businessInfo.businessType }}</small>
                      </td>
                      <td class="text-xs text-secondary">{{ a.submittedAt | date:'shortDate' }}</td>
                      <td>
                        <span class="badge badge-success text-xs">2 files attached</span>
                      </td>
                      <td class="text-right">
                        <a [routerLink]="['/admin/applications', a.id]" class="btn btn-primary btn-sm">
                          Inspect &amp; Verify
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="empty-state py-8 text-center" *ngIf="pendingApps.length === 0">
                <app-icon name="check-circle" [size]="32" color="var(--color-success)"></app-icon>
                <p class="text-xs text-secondary mt-2">All verification applications have been processed.</p>
              </div>
            </div>

            <!-- Recent Administrator Activity Logs -->
            <div class="card panel-box">
              <div class="panel-header flex justify-between items-center mb-4">
                <div>
                  <h3>Audit Activity Trail</h3>
                  <p class="text-xs text-secondary">Logged administrator actions</p>
                </div>
                <a routerLink="/admin/activity-logs" class="btn btn-ghost btn-sm">Full Audit &rarr;</a>
              </div>

              <div class="activity-timeline">
                <div class="activity-row" *ngFor="let log of recentLogs">
                  <div class="act-dot"></div>
                  <div class="act-content">
                    <div class="flex justify-between items-center">
                      <strong class="text-xs">{{ log.action }}</strong>
                      <small class="text-tertiary">{{ log.timestamp | date:'short' }}</small>
                    </div>
                    <p class="text-xs text-secondary mt-1">{{ log.details }}</p>
                    <small class="text-tertiary block mt-1" *ngIf="log.reason">Reason: {{ log.reason }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--color-bg-secondary);
    }
    .admin-main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: var(--space-8) var(--space-6);
    }
    .admin-container {
      max-width: var(--container-max);
      margin: 0 auto;
    }

    .pending-alert {
      padding: var(--space-4) var(--space-5);
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .stat-metric-box {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
    }
    .stat-metric-box.highlight-box {
      background: var(--color-primary-lighter);
      border-color: rgba(45, 90, 61, 0.3);
    }
    .metric-lbl {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-text-secondary);
      display: block;
    }
    .metric-val {
      font-size: 1.875rem;
      font-weight: 800;
      display: block;
      margin: 4px 0 2px;
      line-height: 1.1;
    }

    .admin-content-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: var(--space-6);
    }
    .panel-box {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
    }
    .panel-box h3 {
      font-size: var(--font-size-base);
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .activity-row {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-border);
    }
    .act-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #F59E0B;
      margin-top: 4px;
    }
    .act-content {
      flex: 1;
    }

    @media (max-width: 900px) {
      .admin-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .admin-content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalCustomers: 0,
    totalSellers: 0,
    pendingApplications: 0,
    approvedSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalOrderValue: 0
  };
  pendingApps: SellerApplication[] = [];
  recentLogs: ActivityLog[] = [];

  constructor(
    private adminService: AdminService,
    private mockData: MockDataService
  ) {}

  ngOnInit() {
    this.stats = this.adminService.getDashboardStats();
    this.pendingApps = this.mockData.getSellerApplications().filter(a => a.status === 'pending');
    this.recentLogs = this.adminService.getActivityLogs().slice(0, 6);
  }
}
