import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import { Report, ReportStatus } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-customer-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, SellerSidebarComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container">
          <!-- Page Header -->
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-primary">Quality Control & Customer Care</span>
              <h1>Customer Food Reports</h1>
              <p class="text-xs text-secondary">
                Inspect customer-reported meal discrepancies, review evidence photos, and submit official kitchen responses.
              </p>
            </div>
            <div class="header-stat-pill" *ngIf="pendingResponseCount() > 0">
              <app-icon name="alert-circle" [size]="15" color="#B45309"></app-icon>
              <span>{{ pendingResponseCount() }} Action Required</span>
            </div>
          </div>

          <!-- KPI Summary Cards -->
          <div class="grid-4 mb-6">
            <div class="stat-card card">
              <span class="stat-label">Total Reports</span>
              <strong class="stat-value">{{ reports.length }}</strong>
              <small class="stat-sub text-secondary">All-time customer cases</small>
            </div>
            <div class="stat-card card">
              <span class="stat-label">Needs Response</span>
              <strong class="stat-value text-warning">{{ countStatus('submitted') }}</strong>
              <small class="stat-sub text-warning">Awaiting kitchen explanation</small>
            </div>
            <div class="stat-card card">
              <span class="stat-label">Under Investigation</span>
              <strong class="stat-value text-info">{{ countStatus('under_review') }}</strong>
              <small class="stat-sub text-secondary">Admin & kitchen review</small>
            </div>
            <div class="stat-card card">
              <span class="stat-label">Resolved</span>
              <strong class="stat-value text-success">{{ countStatus('resolved') }}</strong>
              <small class="stat-sub text-success">Cases closed</small>
            </div>
          </div>

          <!-- Filters & Search Toolbar -->
          <div class="card toolbar-card mb-6">
            <div class="flex justify-between items-center flex-wrap gap-4">
              <!-- Filter Tabs -->
              <div class="filter-tabs">
                <button
                  class="filter-btn"
                  [class.active]="activeTab === 'all'"
                  (click)="setTab('all')"
                >
                  All ({{ reports.length }})
                </button>
                <button
                  class="filter-btn"
                  [class.active]="activeTab === 'submitted'"
                  (click)="setTab('submitted')"
                >
                  Needs Response ({{ countStatus('submitted') }})
                </button>
                <button
                  class="filter-btn"
                  [class.active]="activeTab === 'under_review'"
                  (click)="setTab('under_review')"
                >
                  Under Review ({{ countStatus('under_review') }})
                </button>
                <button
                  class="filter-btn"
                  [class.active]="activeTab === 'resolved'"
                  (click)="setTab('resolved')"
                >
                  Resolved ({{ countStatus('resolved') }})
                </button>
              </div>

              <!-- Search Box -->
              <div class="search-wrap">
                <app-icon name="search" [size]="16" color="var(--color-text-tertiary)"></app-icon>
                <input
                  type="text"
                  class="form-control search-input"
                  placeholder="Search ref #, order #, meal, customer..."
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="applyFilter()"
                />
              </div>
            </div>
          </div>

          <!-- Alert for action feedback -->
          <div class="alert alert-success mb-4" *ngIf="actionFeedback">
            <app-icon name="check-circle" [size]="16"></app-icon>
            <span>{{ actionFeedback }}</span>
          </div>

          <!-- Reports List -->
          <div class="reports-list" *ngIf="filteredReports.length > 0">
            <div class="card report-item-card mb-4" *ngFor="let rep of filteredReports">
              <!-- Card Header -->
              <div class="report-header">
                <div class="header-left">
                  <div class="flex items-center gap-2">
                    <span class="ref-badge">{{ rep.referenceNumber }}</span>
                    <span class="order-link-pill">Order #{{ rep.orderNumber }}</span>
                  </div>
                  <span class="report-date text-xs text-secondary mt-1 block">
                    Reported on {{ rep.createdAt | date:'medium' }} by <strong>{{ rep.customerName }}</strong>
                    <span class="text-tertiary" *ngIf="rep.customerEmail">({{ rep.customerEmail }})</span>
                  </span>
                </div>

                <div class="header-right">
                  <span class="badge" [ngClass]="getStatusBadge(rep.status)">
                    {{ formatStatus(rep.status) }}
                  </span>
                </div>
              </div>

              <!-- Dish & Reason Info -->
              <div class="dish-issue-strip mt-3">
                <div class="dish-thumb" *ngIf="rep.productImageUrl">
                  <img [src]="rep.productImageUrl" [alt]="rep.productName" />
                </div>
                <div class="dish-meta">
                  <strong class="dish-name">{{ rep.productName }}</strong>
                  <div class="reason-tag-line mt-1">
                    <span class="reason-pill">{{ rep.reason }}</span>
                  </div>
                </div>
              </div>

              <!-- Customer Complaint Description -->
              <div class="customer-complaint-box mt-3">
                <span class="box-title">Customer Complaint Statement:</span>
                <p class="complaint-text">"{{ rep.description }}"</p>

                <!-- Attached Photos -->
                <div class="evidence-gallery mt-3" *ngIf="rep.evidenceImages && rep.evidenceImages.length > 0">
                  <span class="box-sub-title">Attached Evidence Photos ({{ rep.evidenceImages.length }}):</span>
                  <div class="evidence-grid mt-1">
                    <div
                      class="evidence-card"
                      *ngFor="let img of rep.evidenceImages"
                      (click)="viewPhoto(img)"
                      title="Click to zoom evidence"
                    >
                      <img [src]="img" alt="Customer evidence" />
                      <div class="evidence-overlay">
                        <app-icon name="external-link" [size]="14" color="white"></app-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Seller Response Section -->
              <div class="seller-response-block mt-4">
                <!-- Already Responded View -->
                <div class="existing-response-box" *ngIf="rep.sellerResponse">
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2">
                      <app-icon name="store" [size]="15" color="var(--color-primary)"></app-icon>
                      <strong class="text-xs text-primary">Your Kitchen Response:</strong>
                    </div>
                    <span class="text-xs text-secondary">{{ rep.sellerResponse.respondedAt | date:'medium' }}</span>
                  </div>
                  <p class="text-xs mb-0">{{ rep.sellerResponse.response }}</p>
                </div>

                <!-- Response Input Form (If not responded yet) -->
                <div class="reply-form-box" *ngIf="!rep.sellerResponse">
                  <div class="flex items-center gap-2 mb-2">
                    <app-icon name="message-square" [size]="15" color="var(--color-primary)"></app-icon>
                    <strong class="text-xs">Submit Kitchen Response & Explanation:</strong>
                  </div>
                  <textarea
                    class="form-control reply-textarea"
                    rows="3"
                    [(ngModel)]="responseDrafts[rep.id]"
                    placeholder="Provide root-cause explanation (e.g. prep check, packaging audit) or compensation offered to the customer..."
                  ></textarea>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-secondary">
                      This response will be visible to the customer and GymPlate Administration.
                    </span>
                    <button
                      class="btn btn-primary btn-sm"
                      (click)="submitKitchenResponse(rep)"
                      [disabled]="!responseDrafts[rep.id] || responseDrafts[rep.id].trim().length < 5"
                    >
                      <app-icon name="check" [size]="14"></app-icon>
                      Send Kitchen Response
                    </button>
                  </div>
                </div>
              </div>

              <!-- Admin Resolution Section -->
              <div class="admin-verdict-box mt-3" *ngIf="rep.adminResolution">
                <div class="flex items-center gap-2 mb-1">
                  <app-icon name="shield" [size]="15" color="#166534"></app-icon>
                  <strong class="text-xs text-success">Official Administrator Resolution:</strong>
                  <span class="text-xs text-secondary ml-auto">{{ rep.adminResolution.resolvedAt | date:'medium' }}</span>
                </div>
                <div class="text-xs font-bold text-success">{{ rep.adminResolution.actionTaken }}</div>
                <p class="text-xs text-secondary mb-0 mt-1">{{ rep.adminResolution.remarks }}</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="card empty-state text-center py-12" *ngIf="filteredReports.length === 0">
            <app-icon name="check-circle" [size]="48" color="var(--color-primary)"></app-icon>
            <h3 class="mt-3">No Customer Reports</h3>
            <p class="text-xs text-secondary mt-1">
              {{ searchQuery || activeTab !== 'all' ? 'No reports match your selected filters.' : 'Your kitchen has maintained excellent quality. No customer issues reported!' }}
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- Photo Zoom Modal -->
    <div class="modal-overlay" *ngIf="zoomedPhoto" (click)="zoomedPhoto = null">
      <div class="modal-content photo-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Customer Evidence Photo</h3>
          <button class="modal-close" (click)="zoomedPhoto = null">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>
        <div class="modal-body text-center p-2">
          <img [src]="zoomedPhoto" alt="Zoomed evidence" class="zoomed-img" />
        </div>
      </div>
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
      max-width: var(--container-width);
      margin: 0 auto;
    }

    .header-stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FDE68A;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
    }

    /* KPI Cards */
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
    }
    .stat-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
    }
    .stat-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      margin-bottom: 4px;
    }
    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 800;
      color: var(--color-text);
      line-height: 1.2;
    }
    .stat-sub {
      font-size: 11px;
      margin-top: 4px;
      display: block;
    }

    /* Toolbar */
    .toolbar-card {
      padding: 12px 16px;
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
    }
    .filter-tabs {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .filter-btn {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      background: none;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .filter-btn:hover {
      color: var(--color-text);
      background: var(--color-bg-secondary);
    }
    .filter-btn.active {
      background: rgba(22, 101, 52, 0.08);
      color: var(--color-primary);
      border-color: rgba(22, 101, 52, 0.2);
    }

    .search-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 4px 10px;
      min-width: 260px;
    }
    .search-input {
      border: none;
      background: transparent;
      padding: 4px 0;
      font-size: 12px;
      width: 100%;
      outline: none;
    }

    /* Report Card */
    .report-item-card {
      padding: 20px;
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
      transition: border-color var(--transition-fast);
    }
    .report-item-card:hover {
      border-color: #CBD5E1;
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      flex-wrap: wrap;
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 12px;
    }
    .ref-badge {
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
      color: var(--color-primary);
      background: rgba(22, 101, 52, 0.08);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .order-link-pill {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text);
      background: #F1F5F9;
      padding: 2px 8px;
      border-radius: 4px;
    }

    /* Dish Info */
    .dish-issue-strip {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: #F8FAFC;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }
    .dish-thumb {
      width: 44px;
      height: 44px;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
      background: #E2E8F0;
    }
    .dish-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .dish-meta {
      flex: 1;
      min-width: 0;
    }
    .dish-name {
      font-size: 13.5px;
      color: var(--color-text);
    }
    .reason-pill {
      display: inline-block;
      font-size: 11.5px;
      font-weight: 700;
      color: #991B1B;
      background: #FEE2E2;
      padding: 2px 8px;
      border-radius: 4px;
    }

    /* Customer Complaint Box */
    .customer-complaint-box {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
    }
    .box-title {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      margin-bottom: 4px;
    }
    .box-sub-title {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-secondary);
      margin-bottom: 6px;
    }
    .complaint-text {
      font-size: 13px;
      line-height: 1.5;
      color: var(--color-text);
      margin: 0;
    }

    /* Evidence Gallery */
    .evidence-grid {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .evidence-card {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--color-border);
      cursor: pointer;
      background: #E2E8F0;
    }
    .evidence-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .evidence-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .evidence-card:hover .evidence-overlay {
      opacity: 1;
    }

    /* Kitchen Response Form & View */
    .existing-response-box {
      background: #F0FDF4;
      border: 1px solid #DCFCE7;
      border-radius: var(--radius-sm);
      padding: 10px 14px;
    }
    .reply-form-box {
      background: #F8FAFC;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
    }
    .reply-textarea {
      resize: vertical;
      font-size: 12.5px;
      line-height: 1.45;
      background: white;
    }

    /* Admin Resolution */
    .admin-verdict-box {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: var(--radius-sm);
      padding: 10px 14px;
    }

    /* Photo Modal */
    .photo-modal {
      max-width: 650px;
    }
    .zoomed-img {
      max-width: 100%;
      max-height: 75vh;
      border-radius: var(--radius-sm);
      object-fit: contain;
    }

    @media (max-width: 900px) {
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .grid-4 {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 480px) {
      .grid-4 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SellerCustomerReportsComponent implements OnInit {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  activeTab: 'all' | 'submitted' | 'under_review' | 'resolved' = 'all';
  searchQuery = '';
  actionFeedback = '';
  zoomedPhoto: string | null = null;

  responseDrafts: Record<string, string> = {};

  constructor(
    private authService: AuthService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.loadSellerReports();
  }

  loadSellerReports() {
    const user = this.authService.user();
    if (user) {
      this.reports = this.reportService.getSellerReports(user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.applyFilter();
    }
  }

  setTab(tab: 'all' | 'submitted' | 'under_review' | 'resolved') {
    this.activeTab = tab;
    this.applyFilter();
  }

  applyFilter() {
    let list = this.reports;

    if (this.activeTab !== 'all') {
      list = list.filter(r => r.status === this.activeTab);
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(r =>
        r.referenceNumber.toLowerCase().includes(q) ||
        r.orderNumber.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }

    this.filteredReports = list;
  }

  countStatus(status: ReportStatus): number {
    return this.reports.filter(r => r.status === status).length;
  }

  pendingResponseCount(): number {
    return this.reports.filter(r => !r.sellerResponse && r.status !== 'resolved' && r.status !== 'rejected').length;
  }

  submitKitchenResponse(report: Report) {
    const draft = this.responseDrafts[report.id];
    if (!draft || draft.trim().length < 5) return;

    const user = this.authService.user();
    const sellerName = user ? `${user.firstName} ${user.lastName} (${report.businessName})` : report.businessName;

    const ok = this.reportService.respondAsSeller(report.id, draft.trim(), sellerName);
    if (ok) {
      this.actionFeedback = `Response successfully submitted for Report ${report.referenceNumber}.`;
      this.responseDrafts[report.id] = '';
      this.loadSellerReports();
      setTimeout(() => this.actionFeedback = '', 4000);
    }
  }

  viewPhoto(url: string) {
    this.zoomedPhoto = url;
  }

  getStatusBadge(status: ReportStatus): string {
    switch (status) {
      case 'submitted': return 'badge-warning';
      case 'under_review': return 'badge-info';
      case 'resolved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }

  formatStatus(status: ReportStatus): string {
    switch (status) {
      case 'submitted': return 'Needs Kitchen Response';
      case 'under_review': return 'Under Investigation';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  }
}
