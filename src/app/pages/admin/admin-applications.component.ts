import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { SellerApplication } from '../../models';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminSidebarComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container">
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-warning">Compliance Review</span>
              <h1>Seller Verification Applications</h1>
              <p class="text-xs text-secondary">Review identity and health permit compliance for fitness kitchen candidates.</p>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="filter-tabs card mb-6">
            <button class="tab-btn" [class.active]="statusFilter === 'all'" (click)="setFilter('all')">
              All Applications ({{ applications.length }})
            </button>
            <button class="tab-btn" [class.active]="statusFilter === 'pending'" (click)="setFilter('pending')">
              Pending Review ({{ countPending() }})
            </button>
            <button class="tab-btn" [class.active]="statusFilter === 'approved'" (click)="setFilter('approved')">
              Approved ({{ countApproved() }})
            </button>
            <button class="tab-btn" [class.active]="statusFilter === 'rejected'" (click)="setFilter('rejected')">
              Rejected ({{ countRejected() }})
            </button>
            <button class="tab-btn" [class.active]="statusFilter === 'info_required'" (click)="setFilter('info_required')">
              More Info Required ({{ countInfoRequired() }})
            </button>
          </div>

          <!-- Applications Table -->
          <div class="card table-panel">
            <div class="table-container" *ngIf="filteredApplications.length > 0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Commercial Kitchen</th>
                    <th>Representative</th>
                    <th>Submitted Date</th>
                    <th>Attached Files</th>
                    <th class="text-center">Status</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let a of filteredApplications">
                    <td>
                      <strong class="text-xs block">{{ a.businessInfo.businessName }}</strong>
                      <span class="text-xs text-secondary">{{ a.businessInfo.businessType }}</span>
                      <small class="text-tertiary block">{{ a.businessInfo.businessCity }}, {{ a.businessInfo.businessState }}</small>
                    </td>
                    <td>
                      <span class="text-xs font-medium">{{ a.personalInfo.firstName }} {{ a.personalInfo.lastName }}</span>
                      <span class="text-xs text-secondary block">{{ a.personalInfo.phone }}</span>
                    </td>
                    <td class="text-xs text-secondary">{{ a.submittedAt | date:'mediumDate' }}</td>
                    <td>
                      <div class="flex items-center gap-1">
                        <app-icon name="file-text" [size]="14" color="var(--color-primary)"></app-icon>
                        <span class="text-xs">2 verified documents</span>
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="'badge-' + getBadgeClass(a.status)">
                        {{ formatStatus(a.status) }}
                      </span>
                    </td>
                    <td class="text-right">
                      <a [routerLink]="['/admin/applications', a.id]" class="btn btn-primary btn-sm">
                        Inspect &amp; Decide
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="empty-state py-12 text-center" *ngIf="filteredApplications.length === 0">
              <app-icon name="file-text" [size]="48" color="var(--color-text-tertiary)"></app-icon>
              <h3>No Applications in this Queue</h3>
              <p class="text-xs text-secondary mt-1">There are no seller applications matching this status filter.</p>
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

    .filter-tabs {
      display: flex;
      padding: 4px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: white;
      overflow-x: auto;
    }
    .tab-btn {
      flex: 1;
      padding: 8px 12px;
      font-size: var(--font-size-xs);
      font-weight: 500;
      color: var(--color-text-secondary);
      background: none;
      border: none;
      cursor: pointer;
      white-space: nowrap;
    }
    .tab-btn.active {
      background: #FEF3C7;
      color: #92400E;
      font-weight: 700;
      border-radius: var(--radius-sm);
    }

    .table-panel {
      border: 1px solid var(--color-border);
      background: white;
    }

    @media (max-width: 900px) {
      .admin-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
    }
  `]
})
export class AdminApplicationsComponent implements OnInit {
  applications: SellerApplication[] = [];
  filteredApplications: SellerApplication[] = [];
  statusFilter = 'all';

  constructor(private mockData: MockDataService) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.applications = this.mockData.getSellerApplications()
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    this.applyFilter();
  }

  setFilter(filter: string) {
    this.statusFilter = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (this.statusFilter === 'all') {
      this.filteredApplications = this.applications;
    } else {
      this.filteredApplications = this.applications.filter(a => a.status === this.statusFilter);
    }
  }

  countPending(): number {
    return this.applications.filter(a => a.status === 'pending').length;
  }
  countApproved(): number {
    return this.applications.filter(a => a.status === 'approved').length;
  }
  countRejected(): number {
    return this.applications.filter(a => a.status === 'rejected').length;
  }
  countInfoRequired(): number {
    return this.applications.filter(a => a.status === 'info_required').length;
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
      info_required: 'Info Needed'
    };
    return map[status] || status;
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'info_required': return 'info';
      default: return 'warning';
    }
  }
}
