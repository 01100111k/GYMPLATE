import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SellerService } from '../../services/seller.service';
import { AuthService } from '../../services/auth.service';
import { SellerApplication } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-pending',
  standalone: true,
  imports: [CommonModule, RouterLink, SellerSidebarComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container container-narrow" *ngIf="application">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-primary">Compliance Verification</span>
            <h1>Seller Application Status</h1>
            <p class="text-xs text-secondary">Current administrative verification stage for {{ application.businessInfo.businessName }}.</p>
          </div>

          <!-- Status Card -->
          <div class="card status-display-card mb-6" [ngClass]="'status-border-' + application.status">
            <div class="flex items-center gap-4">
              <div class="status-icon-bubble" [ngClass]="'bubble-' + application.status">
                <app-icon [name]="getStatusIcon()" [size]="28"></app-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h2>Status: {{ formatStatus(application.status) }}</h2>
                  <span class="badge" [ngClass]="'badge-' + getBadgeClass()">{{ application.status }}</span>
                </div>
                <p class="text-xs text-secondary mt-1">Submitted on {{ application.submittedAt | date:'medium' }}</p>
              </div>
            </div>

            <!-- Pending Description -->
            <div class="status-body-content mt-6" *ngIf="application.status === 'pending'">
              <div class="alert alert-info">
                <app-icon name="clock" [size]="18"></app-icon>
                <div>
                  <strong>Queue Position: Pending Document Review</strong>
                  <p class="text-xs mt-1">
                    An Administrator is reviewing your attached government identification and health permits. Product publishing will automatically unlock once approved.
                  </p>
                </div>
              </div>
            </div>

            <!-- Rejected Description & Reason -->
            <div class="status-body-content mt-6" *ngIf="application.status === 'rejected'">
              <div class="alert alert-danger">
                <app-icon name="alert-triangle" [size]="20"></app-icon>
                <div>
                  <strong>Application Rejected by Administrator</strong>
                  <p class="text-xs font-semibold mt-1">Rejection Reason:</p>
                  <p class="text-xs mt-1 reason-text">{{ application.rejectionReason || 'Commercial food license requirements were not fulfilled.' }}</p>
                </div>
              </div>
            </div>

            <!-- More Info Required Description & Reason -->
            <div class="status-body-content mt-6" *ngIf="application.status === 'info_required'">
              <div class="alert alert-warning">
                <app-icon name="info" [size]="20"></app-icon>
                <div>
                  <strong>Additional Documentation Requested</strong>
                  <p class="text-xs font-semibold mt-1">Administrator Request:</p>
                  <p class="text-xs mt-1 reason-text">{{ application.infoRequestReason || 'Please upload a clearer image of your business permit.' }}</p>
                </div>
              </div>
            </div>

            <!-- Approved Description -->
            <div class="status-body-content mt-6" *ngIf="application.status === 'approved'">
              <div class="alert alert-success">
                <app-icon name="check-circle" [size]="20"></app-icon>
                <div>
                  <strong>Verified Partner Approved</strong>
                  <p class="text-xs mt-1">Your kitchen has passed verification. You can now add dishes to the marketplace.</p>
                </div>
              </div>
              <a routerLink="/seller/products/add" class="btn btn-primary btn-sm mt-3">
                <app-icon name="plus" [size]="14"></app-icon>
                Add First Meal
              </a>
            </div>
          </div>

          <!-- Submitted Summary -->
          <div class="card submitted-details-card">
            <h3>Submitted Documentation</h3>
            <div class="doc-list mt-3">
              <div class="doc-item">
                <app-icon name="file-text" [size]="16" color="var(--color-primary)"></app-icon>
                <div class="flex-1">
                  <span class="text-xs font-semibold block">Government Photo Identification</span>
                  <span class="text-xs text-secondary">{{ application.documents.governmentId?.name || 'Attached' }}</span>
                </div>
                <span class="badge badge-success">Attached</span>
              </div>

              <div class="doc-item mt-2">
                <app-icon name="file-text" [size]="16" color="var(--color-primary)"></app-icon>
                <div class="flex-1">
                  <span class="text-xs font-semibold block">Commercial Sanitary / Food Permit</span>
                  <span class="text-xs text-secondary">{{ application.documents.businessPermit?.name || 'Attached' }}</span>
                </div>
                <span class="badge badge-success">Attached</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .seller-layout {
      display: flex;
      min-height: 100vh;
      background: var(--color-bg-secondary);
    }
    .seller-main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: var(--space-8) var(--space-6);
    }
    .seller-container {
      max-width: var(--container-narrow);
      margin: 0 auto;
    }

    .status-display-card {
      padding: var(--space-8);
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-lg);
    }
    .status-border-pending { border-left: 4px solid var(--color-warning); }
    .status-border-approved { border-left: 4px solid var(--color-success); }
    .status-border-rejected { border-left: 4px solid var(--color-danger); }
    .status-border-info_required { border-left: 4px solid #3B82F6; }

    .status-icon-bubble {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bubble-pending { background: var(--color-warning-bg); color: #92400E; }
    .bubble-approved { background: var(--color-success-bg); color: #166534; }
    .bubble-rejected { background: var(--color-danger-bg); color: #991B1B; }
    .bubble-info_required { background: var(--color-info-bg); color: #1E40AF; }

    .reason-text {
      background: rgba(0, 0, 0, 0.04);
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      font-style: italic;
    }

    .submitted-details-card {
      padding: var(--space-6);
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
    }
    .submitted-details-card h3 {
      font-size: var(--font-size-base);
    }
    .doc-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 10px;
      background: var(--color-bg-secondary);
      border-radius: var(--radius);
      border: 1px solid var(--color-border);
    }

    .alert {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-4);
      border-radius: var(--radius);
    }
    .alert-info { background: var(--color-info-bg); color: #1E40AF; border: 1px solid rgba(59, 130, 246, 0.3); }
    .alert-danger { background: var(--color-danger-bg); color: #991B1B; border: 1px solid rgba(220, 53, 69, 0.3); }
    .alert-warning { background: var(--color-warning-bg); color: #92400E; border: 1px solid rgba(245, 158, 11, 0.3); }
    .alert-success { background: var(--color-success-bg); color: #166534; border: 1px solid rgba(40, 167, 69, 0.3); }

    @media (max-width: 900px) {
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
    }
  `]
})
export class SellerPendingComponent implements OnInit {
  application: SellerApplication | undefined;

  constructor(
    private authService: AuthService,
    private sellerService: SellerService
  ) {}

  ngOnInit() {
    const user = this.authService.user();
    if (user) {
      this.application = this.sellerService.getApplication(user.id);
    }
  }

  formatStatus(s: string): string {
    const map: Record<string, string> = {
      pending: 'Under Review',
      approved: 'Approved Commercial Seller',
      rejected: 'Application Rejected',
      info_required: 'More Information Required'
    };
    return map[s] || s;
  }

  getBadgeClass(): string {
    switch (this.application?.status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'info_required': return 'info';
      default: return 'warning';
    }
  }

  getStatusIcon(): string {
    switch (this.application?.status) {
      case 'approved': return 'check-circle';
      case 'rejected': return 'alert-circle';
      case 'info_required': return 'info';
      default: return 'clock';
    }
  }
}
