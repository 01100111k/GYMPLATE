import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { MockDataService } from '../../services/mock-data.service';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container">
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-warning">Macro Insights & Platform Economics</span>
              <h1>Platform Reports & Analytics</h1>
              <p class="text-xs text-secondary">Ecosystem order volume, commercial onboarding velocity, and commission revenue.</p>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="printReport()">
              <app-icon name="printer" [size]="14"></app-icon>
              Print System Audit
            </button>
          </div>

          <!-- Distinction Banner: Order Value vs Actual Platform Revenue -->
          <div class="card revenue-distinction-banner mb-6">
            <div class="flex items-start gap-4">
              <div class="dist-icon">
                <app-icon name="dollar-sign" [size]="24" color="var(--color-primary)"></app-icon>
              </div>
              <div class="flex-1">
                <strong class="text-xs uppercase text-primary block">Financial Accounting Distinction</strong>
                <p class="text-xs text-secondary mt-1">
                  <strong>Gross Order Value (GMV)</strong> represents total food sales transacted between customers and commercial kitchens.
                  <strong>Platform Commission Revenue</strong> represents the 5% service fee retained by GymPlate for infrastructure, moderation, and verification.
                </p>
                <div class="revenue-chips mt-3">
                  <div class="chip">
                    <span class="clbl">Gross Order Value:</span>
                    <strong class="cval">{{ stats.totalOrderValue | currency:'PHP':'symbol' }}</strong>
                  </div>
                  <div class="chip highlight">
                    <span class="clbl">Platform Retained Commission (5%):</span>
                    <strong class="cval text-primary">{{ (stats.totalOrderValue * 0.05) | currency:'PHP':'symbol' }}</strong>
                  </div>
                  <div class="chip">
                    <span class="clbl">Kitchen Partner Payouts:</span>
                    <strong class="cval">{{ (stats.totalOrderValue * 0.95) | currency:'PHP':'symbol' }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Metrics Grid -->
          <div class="grid-4 mb-6">
            <div class="card stat-box">
              <span class="lbl">Seller Approval Rate</span>
              <strong class="val text-success">{{ getApprovalRate() | number:'1.0-0' }}%</strong>
              <small class="text-tertiary">{{ stats.approvedSellers }} of {{ totalApplications }} applications</small>
            </div>
            <div class="card stat-box">
              <span class="lbl">Customer Fulfillment Rate</span>
              <strong class="val text-primary">{{ getFulfillmentRate() | number:'1.0-0' }}%</strong>
              <small class="text-tertiary">{{ stats.completedOrders }} orders completed</small>
            </div>
            <div class="card stat-box">
              <span class="lbl">Avg Dish Caloric Density</span>
              <strong class="val">415 kcal</strong>
              <small class="text-tertiary">Fitness-standard recipes</small>
            </div>
            <div class="card stat-box">
              <span class="lbl">Avg Protein / Serving</span>
              <strong class="val text-primary">35.4g</strong>
              <small class="text-tertiary">Lean muscle benchmark</small>
            </div>
          </div>

          <!-- Status Distribution & Recent Growth -->
          <div class="reports-grid">
            <div class="card panel-box">
              <h3>Order Status Distribution</h3>
              <div class="status-dist-list mt-4">
                <div class="dist-row" *ngFor="let row of statusDistribution">
                  <span class="capitalize text-xs font-medium">{{ row.status }}</span>
                  <div class="bar-container">
                    <div class="dist-bar" [style.width.%]="row.percentage"></div>
                  </div>
                  <span class="count-badge font-mono text-xs">{{ row.count }} ({{ row.percentage | number:'1.0-0' }}%)</span>
                </div>
              </div>
            </div>

            <div class="card panel-box">
              <h3>Onboarding & Verification Pipeline</h3>
              <div class="pipeline-list mt-4">
                <div class="p-item">
                  <span class="text-xs font-semibold">Active Commercial Kitchens</span>
                  <span class="badge badge-success font-bold">{{ stats.approvedSellers }} Live</span>
                </div>
                <div class="p-item mt-2">
                  <span class="text-xs font-semibold">Pending Compliance Queue</span>
                  <span class="badge badge-warning font-bold">{{ stats.pendingApplications }} Under Review</span>
                </div>
                <div class="p-item mt-2">
                  <span class="text-xs font-semibold">Registered Fitness Diners</span>
                  <span class="badge badge-neutral font-bold">{{ stats.totalCustomers }} Customers</span>
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

    .revenue-distinction-banner {
      padding: var(--space-6);
      background: white;
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-primary);
    }
    .revenue-chips {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .chip {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      padding: 6px 12px;
      border-radius: var(--radius);
      display: flex;
      gap: 6px;
      font-size: var(--font-size-xs);
    }
    .chip.highlight {
      background: var(--color-primary-lighter);
      border-color: rgba(45, 90, 61, 0.3);
    }

    .stat-box {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
      text-align: center;
    }
    .stat-box .lbl {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-text-secondary);
      display: block;
    }
    .stat-box .val {
      font-size: 1.875rem;
      font-weight: 800;
      display: block;
      margin: 2px 0;
    }

    .reports-grid {
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

    .status-dist-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .dist-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .dist-row span:first-child {
      width: 90px;
    }
    .bar-container {
      flex: 1;
      height: 8px;
      background: var(--color-bg-secondary);
      border-radius: 4px;
      overflow: hidden;
    }
    .dist-bar {
      height: 100%;
      background: var(--color-primary);
    }
    .count-badge {
      width: 70px;
      text-align: right;
    }

    .p-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: var(--color-bg-secondary);
      border-radius: var(--radius);
    }

    @media (max-width: 900px) {
      .admin-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .reports-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminReportsComponent implements OnInit {
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
  totalApplications = 0;
  statusDistribution: { status: string; count: number; percentage: number }[] = [];

  constructor(
    private adminService: AdminService,
    private mockData: MockDataService
  ) {}

  ngOnInit() {
    this.stats = this.adminService.getDashboardStats();
    const apps = this.mockData.getSellerApplications();
    this.totalApplications = apps.length;

    const orders = this.mockData.getOrders();
    const map = new Map<string, number>();
    orders.forEach(o => {
      map.set(o.status, (map.get(o.status) || 0) + 1);
    });

    this.statusDistribution = Array.from(map.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: orders.length > 0 ? (count / orders.length) * 100 : 0
    }));
  }

  getApprovalRate(): number {
    return this.totalApplications > 0 ? (this.stats.approvedSellers / this.totalApplications) * 100 : 100;
  }

  getFulfillmentRate(): number {
    return this.stats.totalOrders > 0 ? (this.stats.completedOrders / this.stats.totalOrders) * 100 : 0;
  }

  printReport() {
    window.print();
  }
}
