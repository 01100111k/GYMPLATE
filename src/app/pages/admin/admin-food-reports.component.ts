import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { Report, ReportStatus, ReportReason, Business } from '../../models';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-food-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container">
          <!-- Page Header -->
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-warning">Platform Compliance & Quality Oversight</span>
              <h1>Food & Order Reports Management</h1>
              <p class="text-xs text-secondary">
                Audit customer food complaints, inspect evidence photos, mediate disputes, and enforce health & nutritional compliance.
              </p>
            </div>
            <div class="header-action-badge" *ngIf="urgentCount() > 0">
              <app-icon name="alert-triangle" [size]="15" color="#DC2626"></app-icon>
              <span>{{ urgentCount() }} Priority Safety/Hygiene Cases</span>
            </div>
          </div>

          <!-- KPI Summary Cards -->
          <div class="grid-4 mb-6">
            <div class="stat-card card">
              <span class="stat-label">Total Reported Cases</span>
              <strong class="stat-value">{{ reports.length }}</strong>
              <small class="stat-sub text-secondary">All-time customer filings</small>
            </div>
            <div class="stat-card card">
              <span class="stat-label">Pending / Submitted</span>
              <strong class="stat-value text-warning">{{ countStatus('submitted') }}</strong>
              <small class="stat-sub text-warning">Awaiting moderation review</small>
            </div>
            <div class="stat-card card">
              <span class="stat-label">Under Investigation</span>
              <strong class="stat-value text-info">{{ countStatus('under_review') }}</strong>
              <small class="stat-sub text-secondary">Awaiting kitchen explanation</small>
            </div>
            <div class="stat-card card">
              <span class="stat-label">Resolved & Closed</span>
              <strong class="stat-value text-success">{{ countStatus('resolved') }}</strong>
              <small class="stat-sub text-success">Compliance verified</small>
            </div>
          </div>

          <!-- Multi-dimensional Filter Card -->
          <div class="card filter-card mb-6">
            <div class="filters-grid">
              <!-- Search -->
              <div class="filter-group search-group">
                <label class="filter-label">Search Inquiries</label>
                <div class="search-input-wrap">
                  <app-icon name="search" [size]="15" color="var(--color-text-tertiary)"></app-icon>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search ref #, order #, customer, dish..."
                    [(ngModel)]="searchQuery"
                    (ngModelChange)="applyFilter()"
                  />
                </div>
              </div>

              <!-- Status Filter -->
              <div class="filter-group">
                <label class="filter-label">Status Filter</label>
                <select class="form-control" [(ngModel)]="statusFilter" (change)="applyFilter()">
                  <option value="all">All Statuses ({{ reports.length }})</option>
                  <option value="submitted">Submitted ({{ countStatus('submitted') }})</option>
                  <option value="under_review">Under Review ({{ countStatus('under_review') }})</option>
                  <option value="resolved">Resolved ({{ countStatus('resolved') }})</option>
                  <option value="rejected">Rejected ({{ countStatus('rejected') }})</option>
                </select>
              </div>

              <!-- Reason Filter -->
              <div class="filter-group">
                <label class="filter-label">Reason / Category</label>
                <select class="form-control" [(ngModel)]="reasonFilter" (change)="applyFilter()">
                  <option value="all">All Reasons</option>
                  <option *ngFor="let r of reportReasons" [value]="r">{{ r }}</option>
                </select>
              </div>

              <!-- Kitchen / Seller Filter -->
              <div class="filter-group">
                <label class="filter-label">Kitchen Partner</label>
                <select class="form-control" [(ngModel)]="sellerFilter" (change)="applyFilter()">
                  <option value="all">All Kitchens</option>
                  <option *ngFor="let b of businesses" [value]="b.id">{{ b.businessName }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Action Feedback Alert -->
          <div class="alert alert-success mb-4" *ngIf="actionFeedback">
            <app-icon name="check-circle" [size]="16"></app-icon>
            <span>{{ actionFeedback }}</span>
          </div>

          <!-- Reports Table -->
          <div class="card table-card" *ngIf="filteredReports.length > 0">
            <div class="table-container">
              <table class="admin-reports-table">
                <thead>
                  <tr>
                    <th>Ref # / Date</th>
                    <th>Customer & Order</th>
                    <th>Kitchen Partner</th>
                    <th>Meal Item & Reason</th>
                    <th class="text-center">Evidence</th>
                    <th class="text-center">Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let rep of filteredReports">
                    <!-- Ref & Date -->
                    <td>
                      <span class="ref-link font-mono font-bold">{{ rep.referenceNumber }}</span>
                      <span class="text-xs text-secondary block mt-1">{{ rep.createdAt | date:'mediumDate' }}</span>
                    </td>

                    <!-- Customer & Order -->
                    <td>
                      <strong class="text-xs block">{{ rep.customerName }}</strong>
                      <span class="text-xs text-secondary font-mono">Order #{{ rep.orderNumber }}</span>
                    </td>

                    <!-- Kitchen -->
                    <td>
                      <span class="text-xs font-semibold">{{ rep.businessName }}</span>
                    </td>

                    <!-- Dish & Reason -->
                    <td>
                      <span class="text-xs font-bold block">{{ rep.productName }}</span>
                      <span class="badge" [ngClass]="getReasonBadgeClass(rep.reason)">
                        {{ rep.reason }}
                      </span>
                    </td>

                    <!-- Evidence Photo Count -->
                    <td class="text-center">
                      <span class="evidence-count-badge" *ngIf="rep.evidenceImages && rep.evidenceImages.length > 0">
                        <app-icon name="image" [size]="12"></app-icon>
                        {{ rep.evidenceImages.length }} photo{{ rep.evidenceImages.length > 1 ? 's' : '' }}
                      </span>
                      <span class="text-xs text-tertiary" *ngIf="!rep.evidenceImages || rep.evidenceImages.length === 0">None</span>
                    </td>

                    <!-- Status -->
                    <td class="text-center">
                      <span class="badge" [ngClass]="getStatusBadge(rep.status)">
                        {{ formatStatus(rep.status) }}
                      </span>
                    </td>

                    <!-- Action -->
                    <td class="text-right">
                      <button class="btn btn-outline btn-xs" (click)="openInspectModal(rep)">
                        <app-icon name="edit" [size]="13"></app-icon>
                        Inspect & Resolve
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div class="card empty-state text-center py-12" *ngIf="filteredReports.length === 0">
            <app-icon name="check-circle" [size]="48" color="var(--color-primary)"></app-icon>
            <h3 class="mt-3">No Reports Found</h3>
            <p class="text-xs text-secondary mt-1">
              No reported cases match the selected status, kitchen, or search query.
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- Inspection & Resolution Modal -->
    <div class="modal-overlay" *ngIf="inspectingReport" (click)="closeInspectModal()">
      <div class="modal-content inspect-modal" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-left">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-sm text-primary">{{ inspectingReport.referenceNumber }}</span>
              <span class="badge" [ngClass]="getStatusBadge(inspectingReport.status)">
                {{ formatStatus(inspectingReport.status) }}
              </span>
            </div>
            <span class="text-xs text-secondary block mt-1">
              Order #{{ inspectingReport.orderNumber }} &bull; Submitted on {{ inspectingReport.createdAt | date:'medium' }}
            </span>
          </div>
          <button class="modal-close" (click)="closeInspectModal()" aria-label="Close modal">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="modal-body">
          <!-- 2 Column Case Profile -->
          <div class="parties-grid mb-4">
            <div class="party-card">
              <span class="party-heading">Customer Information</span>
              <strong class="party-name">{{ inspectingReport.customerName }}</strong>
              <div class="party-detail">{{ inspectingReport.customerEmail }}</div>
              <div class="party-detail" *ngIf="inspectingReport.customerPhone">{{ inspectingReport.customerPhone }}</div>
            </div>

            <div class="party-card">
              <span class="party-heading">Kitchen Partner</span>
              <strong class="party-name">{{ inspectingReport.businessName }}</strong>
              <div class="party-detail">Partner Seller: {{ inspectingReport.sellerName || 'Verified Commercial Kitchen' }}</div>
              <div class="party-detail font-mono">Order #{{ inspectingReport.orderNumber }}</div>
            </div>
          </div>

          <!-- Meal Details & Reason -->
          <div class="meal-discrepancy-card mb-4">
            <span class="party-heading">Reported Meal Discrepancy</span>
            <div class="flex items-center justify-between flex-wrap gap-2 mt-1">
              <strong class="text-sm">{{ inspectingReport.productName }}</strong>
              <span class="badge badge-danger">{{ inspectingReport.reason }}</span>
            </div>

            <div class="complaint-box mt-3">
              <span class="box-lbl">Customer Description:</span>
              <p class="complaint-quote">"{{ inspectingReport.description }}"</p>
            </div>

            <!-- Evidence Photo Gallery -->
            <div class="evidence-section mt-3" *ngIf="inspectingReport.evidenceImages && inspectingReport.evidenceImages.length > 0">
              <span class="box-lbl mb-2 block">Customer Photo Evidence ({{ inspectingReport.evidenceImages.length }}):</span>
              <div class="evidence-grid">
                <div
                  class="evidence-box"
                  *ngFor="let img of inspectingReport.evidenceImages"
                  (click)="zoomedPhoto = img"
                  title="Click to zoom evidence image"
                >
                  <img [src]="img" alt="Evidence" />
                  <div class="zoom-pill">Zoom</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kitchen Response (If available) -->
          <div class="seller-response-audit-card mb-4">
            <span class="party-heading">Commercial Kitchen Response</span>
            <div class="seller-reply-content mt-2" *ngIf="inspectingReport.sellerResponse">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-primary">{{ inspectingReport.sellerResponse.respondedBy }}</span>
                <span class="text-xs text-secondary">{{ inspectingReport.sellerResponse.respondedAt | date:'medium' }}</span>
              </div>
              <p class="text-xs mb-0">{{ inspectingReport.sellerResponse.response }}</p>
            </div>
            <div class="no-reply-hint mt-2 text-xs text-secondary italic" *ngIf="!inspectingReport.sellerResponse">
              Kitchen has not yet provided an official explanation for this case.
            </div>
          </div>

          <!-- Administrator Resolution Form -->
          <div class="admin-action-card mb-4">
            <div class="flex items-center gap-2 mb-3">
              <app-icon name="shield" [size]="18" color="var(--color-primary)"></app-icon>
              <h4 class="text-sm font-bold m-0">Administrator Mediation & Resolution</h4>
            </div>

            <!-- Status Choice -->
            <div class="form-group mb-3">
              <label class="form-label" for="resStatusSelect">Update Case Status <span class="text-danger">*</span></label>
              <select id="resStatusSelect" class="form-control" [(ngModel)]="resolutionStatus">
                <option value="submitted">Submitted (Pending Review)</option>
                <option value="under_review">Under Review (Investigation In-Progress)</option>
                <option value="resolved">Resolved (Action Taken & Settled)</option>
                <option value="rejected">Rejected (Dismissed / Invalid Claim)</option>
              </select>
            </div>

            <!-- Action Presets -->
            <div class="form-group mb-3">
              <label class="form-label">Action Taken Presets</label>
              <div class="preset-buttons-row">
                <button
                  type="button"
                  class="btn-preset"
                  *ngFor="let p of actionPresets"
                  (click)="resolutionAction = p"
                >
                  {{ p }}
                </button>
              </div>
              <input
                type="text"
                class="form-control mt-2"
                [(ngModel)]="resolutionAction"
                placeholder="Or specify custom action taken..."
              />
            </div>

            <!-- Remarks -->
            <div class="form-group mb-3">
              <label class="form-label" for="adminRemarks">
                Official Resolution Remarks & Justification <span class="text-danger">*</span>
              </label>
              <textarea
                id="adminRemarks"
                class="form-control"
                rows="3"
                [(ngModel)]="resolutionRemarks"
                placeholder="Provide complete explanation. This will be transmitted to both the customer and the commercial seller..."
              ></textarea>
            </div>
          </div>

          <!-- Case History Timeline -->
          <div class="history-card" *ngIf="inspectingReport.history && inspectingReport.history.length > 0">
            <span class="party-heading mb-2 block">Case Audit Trail</span>
            <div class="timeline-items">
              <div class="timeline-entry" *ngFor="let h of inspectingReport.history">
                <span class="timeline-dot"></span>
                <div class="timeline-content">
                  <div class="flex justify-between items-center">
                    <strong class="text-xs">{{ h.updatedBy }}</strong>
                    <span class="text-xs text-secondary">{{ h.timestamp | date:'short' }}</span>
                  </div>
                  <p class="text-xs text-secondary mb-0 mt-1">{{ h.note }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeInspectModal()">Close</button>
          <button
            class="btn btn-primary"
            (click)="saveResolution()"
            [disabled]="!resolutionRemarks || resolutionRemarks.trim().length < 5"
          >
            <app-icon name="save" [size]="16"></app-icon>
            Save Resolution & Notify Parties
          </button>
        </div>
      </div>
    </div>

    <!-- Zoom Photo Modal -->
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
      max-width: var(--container-width);
      margin: 0 auto;
    }

    .header-action-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #FEE2E2;
      color: #991B1B;
      border: 1px solid #FECACA;
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

    /* Filters Card */
    .filter-card {
      padding: 16px 20px;
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
    }
    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1.2fr 1.2fr;
      gap: 16px;
    }
    .filter-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      margin-bottom: 6px;
    }
    .search-input-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 2px 10px;
    }
    .search-input-wrap input {
      border: none;
      background: transparent;
      padding: 6px 0;
      font-size: 12px;
      outline: none;
      width: 100%;
    }

    /* Table */
    .table-card {
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .admin-reports-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    .admin-reports-table th {
      background: #F8FAFC;
      padding: 12px 14px;
      text-align: left;
      font-weight: 600;
      color: var(--color-text-secondary);
      border-bottom: 1px solid var(--color-border);
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .admin-reports-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }
    .admin-reports-table tr:hover td {
      background: #FCFDFD;
    }

    .ref-link {
      color: var(--color-primary);
    }
    .evidence-count-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #F1F5F9;
      color: var(--color-text);
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 9999px;
    }

    /* Reason Badges */
    .badge-reason-safety {
      background: #FEE2E2;
      color: #991B1B;
      font-size: 11px;
    }
    .badge-reason-nutrition {
      background: #FEF3C7;
      color: #92400E;
      font-size: 11px;
    }
    .badge-reason-neutral {
      background: #F1F5F9;
      color: var(--color-text-secondary);
      font-size: 11px;
    }

    /* Inspection Modal */
    .inspect-modal {
      max-width: 680px;
    }
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .party-card {
      background: #F8FAFC;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
    }
    .party-heading {
      display: block;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      margin-bottom: 4px;
    }
    .party-name {
      font-size: 13.5px;
      color: var(--color-text);
      display: block;
    }
    .party-detail {
      font-size: 11.5px;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }

    .meal-discrepancy-card {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
    }
    .complaint-box {
      background: #F8FAFC;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border-left: 3px solid #DC2626;
    }
    .box-lbl {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-secondary);
      margin-bottom: 2px;
    }
    .complaint-quote {
      font-size: 12.5px;
      color: var(--color-text);
      line-height: 1.5;
      margin: 0;
    }

    .evidence-grid {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .evidence-box {
      position: relative;
      width: 76px;
      height: 76px;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--color-border);
      cursor: pointer;
      background: #E2E8F0;
    }
    .evidence-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .zoom-pill {
      position: absolute;
      bottom: 2px;
      right: 2px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 9px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 2px;
    }

    .seller-response-audit-card {
      background: #F0FDF4;
      border: 1px solid #DCFCE7;
      border-radius: var(--radius-sm);
      padding: 12px 14px;
    }

    .admin-action-card {
      background: #F8FAFC;
      border: 1px solid #BFDBFE;
      border-radius: var(--radius-md);
      padding: 16px;
    }
    .preset-buttons-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .btn-preset {
      font-size: 11px;
      font-weight: 500;
      padding: 4px 8px;
      background: white;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: all var(--transition-fast);
    }
    .btn-preset:hover {
      background: #EFF6FF;
      color: #1E40AF;
      border-color: #BFDBFE;
    }

    /* Timeline */
    .history-card {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
    }
    .timeline-items {
      position: relative;
      padding-left: 18px;
    }
    .timeline-items::before {
      content: '';
      position: absolute;
      left: 5px;
      top: 4px;
      bottom: 4px;
      width: 2px;
      background: #E2E8F0;
    }
    .timeline-entry {
      position: relative;
      margin-bottom: 10px;
    }
    .timeline-dot {
      position: absolute;
      left: -17px;
      top: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-primary);
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
      .admin-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .grid-4 {
        grid-template-columns: repeat(2, 1fr);
      }
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 480px) {
      .grid-4 {
        grid-template-columns: 1fr;
      }
      .parties-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminFoodReportsComponent implements OnInit {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  businesses: Business[] = [];

  reportReasons: ReportReason[] = [
    'Food quality issue',
    'Incorrect or missing food item',
    'Food arrived damaged or spilled',
    'Food does not match its description',
    'Incorrect nutritional information',
    'Food safety or hygiene concern',
    'Other'
  ];

  searchQuery = '';
  statusFilter = 'all';
  reasonFilter = 'all';
  sellerFilter = 'all';

  actionFeedback = '';
  inspectingReport: Report | null = null;
  zoomedPhoto: string | null = null;

  resolutionStatus: ReportStatus = 'resolved';
  resolutionAction = '';
  resolutionRemarks = '';

  actionPresets = [
    'Full refund issued to customer',
    'Replacement meal authorized',
    'Seller issued formal warning regarding nutrition labeling',
    'Kitchen inspected for hygiene compliance',
    'Report dismissed - no violation found'
  ];

  constructor(
    private reportService: ReportService,
    private mockData: MockDataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.businesses = this.mockData.getBusinesses();
    this.loadReports();
  }

  loadReports() {
    this.reports = this.reportService.getAllReports()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.applyFilter();
  }

  applyFilter() {
    let list = this.reports;

    if (this.statusFilter !== 'all') {
      list = list.filter(r => r.status === this.statusFilter);
    }

    if (this.reasonFilter !== 'all') {
      list = list.filter(r => r.reason === this.reasonFilter);
    }

    if (this.sellerFilter !== 'all') {
      list = list.filter(r => {
        const bus = this.mockData.getBusinessBySellerId(r.sellerId);
        return bus?.id === this.sellerFilter;
      });
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(r =>
        r.referenceNumber.toLowerCase().includes(q) ||
        r.orderNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.businessName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }

    this.filteredReports = list;
  }

  countStatus(status: ReportStatus): number {
    return this.reports.filter(r => r.status === status).length;
  }

  urgentCount(): number {
    return this.reports.filter(r =>
      (r.reason === 'Food safety or hygiene concern' || r.reason === 'Incorrect nutritional information') &&
      r.status !== 'resolved' && r.status !== 'rejected'
    ).length;
  }

  openInspectModal(report: Report) {
    this.inspectingReport = report;
    this.resolutionStatus = report.status === 'submitted' ? 'under_review' : report.status;
    this.resolutionAction = report.adminResolution?.actionTaken || '';
    this.resolutionRemarks = report.adminResolution?.remarks || '';
  }

  closeInspectModal() {
    this.inspectingReport = null;
    this.resolutionAction = '';
    this.resolutionRemarks = '';
  }

  saveResolution() {
    if (!this.inspectingReport) return;
    if (!this.resolutionRemarks || this.resolutionRemarks.trim().length < 5) return;

    const user = this.authService.user();
    const adminName = user ? `${user.firstName} ${user.lastName} (GymPlate Administration)` : 'System Administrator';

    const action = this.resolutionAction || (this.resolutionStatus === 'resolved' ? 'Case resolved by administrator' : 'Status updated');

    const ok = this.reportService.resolveAsAdmin(
      this.inspectingReport.id,
      this.resolutionStatus,
      this.resolutionRemarks.trim(),
      action,
      adminName
    );

    if (ok) {
      this.actionFeedback = `Resolution successfully applied to ${this.inspectingReport.referenceNumber}. Parties have been notified.`;
      this.closeInspectModal();
      this.loadReports();
      setTimeout(() => this.actionFeedback = '', 5000);
    }
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
      case 'submitted': return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  }

  getReasonBadgeClass(reason: ReportReason): string {
    if (reason === 'Food safety or hygiene concern') return 'badge-reason-safety';
    if (reason === 'Incorrect nutritional information') return 'badge-reason-nutrition';
    return 'badge-reason-neutral';
  }
}
