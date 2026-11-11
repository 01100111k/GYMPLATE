import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { User, Business } from '../../models';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-sellers',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-warning">Platform Governance</span>
            <h1>Registered Kitchen Sellers</h1>
            <p class="text-xs text-secondary">Manage verified kitchens, audit account states, and execute compliance suspensions.</p>
          </div>

          <!-- Search Filter -->
          <div class="card filter-bar mb-6">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="16" class="search-icon"></app-icon>
              <input
                type="text"
                class="form-control"
                placeholder="Search kitchen name, seller email, or location..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterSellers()"
              />
            </div>
          </div>

          <!-- Sellers Table -->
          <div class="card table-panel">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Seller & Representative</th>
                    <th>Store / Brand</th>
                    <th>Contact</th>
                    <th>Registration Date</th>
                    <th class="text-center">Account Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of filteredSellers">
                    <td>
                      <strong class="text-xs block">{{ s.firstName }} {{ s.lastName }}</strong>
                      <span class="text-xs text-secondary">{{ s.email }}</span>
                    </td>
                    <td>
                      <strong class="text-xs text-primary">{{ getBusinessName(s.id) }}</strong>
                      <small class="text-tertiary block">{{ s.city }}, {{ s.state }}</small>
                    </td>
                    <td class="text-xs text-secondary">{{ s.phone }}</td>
                    <td class="text-xs text-secondary">{{ s.createdAt | date:'mediumDate' }}</td>
                    <td class="text-center">
                      <span class="badge" [class.badge-success]="s.accountStatus === 'active'" [class.badge-danger]="s.accountStatus === 'suspended'">
                        {{ s.accountStatus === 'active' ? 'Active' : 'Suspended' }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button
                        *ngIf="s.accountStatus === 'active'"
                        class="btn btn-outline btn-sm text-danger"
                        (click)="openModal(s, 'suspend')"
                      >
                        Suspend
                      </button>
                      <button
                        *ngIf="s.accountStatus === 'suspended'"
                        class="btn btn-success btn-sm"
                        (click)="openModal(s, 'reactivate')"
                      >
                        Reactivate
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Suspension / Reactivation Modal -->
    <div class="modal-overlay" *ngIf="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modalAction === 'suspend' ? 'Suspend Seller Account' : 'Reactivate Seller Account' }}</h3>
          <button class="modal-close" (click)="showModal = false">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-xs text-secondary mb-3">
            Target account: <strong>{{ selectedSeller?.firstName }} {{ selectedSeller?.lastName }}</strong> ({{ selectedSeller?.email }})
          </p>
          <div class="form-group">
            <label class="form-label" for="sellerReason">Administrative Reason *</label>
            <textarea
              id="sellerReason"
              class="form-control"
              rows="3"
              placeholder="e.g. Failure to comply with nutritional verification guidelines..."
              [(ngModel)]="actionReason"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showModal = false">Cancel</button>
          <button
            class="btn"
            [ngClass]="modalAction === 'suspend' ? 'btn-danger' : 'btn-success'"
            [disabled]="!actionReason.trim()"
            (click)="confirmAction()"
          >
            Confirm
          </button>
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
      max-width: var(--container-max);
      margin: 0 auto;
    }
    .filter-bar {
      padding: var(--space-3) var(--space-4);
      background: white;
      border: 1px solid var(--color-border);
    }
    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      color: var(--color-text-secondary);
    }
    .search-input-wrap .form-control {
      padding-left: 36px;
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
export class AdminSellersComponent implements OnInit {
  sellers: User[] = [];
  filteredSellers: User[] = [];
  searchQuery = '';

  showModal = false;
  selectedSeller: User | null = null;
  modalAction: 'suspend' | 'reactivate' = 'suspend';
  actionReason = '';

  constructor(
    private adminService: AdminService,
    private mockData: MockDataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadSellers();
  }

  loadSellers() {
    this.sellers = this.adminService.getSellers();
    this.filterSellers();
  }

  filterSellers() {
    this.filteredSellers = this.sellers.filter(s => {
      const bizName = this.getBusinessName(s.id);
      return !this.searchQuery ||
        s.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        bizName.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
  }

  getBusinessName(sellerId: string): string {
    const biz = this.mockData.getBusinessBySellerId(sellerId);
    return biz ? biz.businessName : 'Pending Storefront';
  }

  openModal(seller: User, action: 'suspend' | 'reactivate') {
    this.selectedSeller = seller;
    this.modalAction = action;
    this.actionReason = '';
    this.showModal = true;
  }

  confirmAction() {
    if (!this.selectedSeller || !this.actionReason.trim()) return;
    const admin = this.authService.user();
    const adminId = admin?.id || 'admin-1';

    if (this.modalAction === 'suspend') {
      this.adminService.suspendUser(this.selectedSeller.id, adminId, this.actionReason);
    } else {
      this.adminService.reactivateUser(this.selectedSeller.id, adminId, this.actionReason);
    }

    this.showModal = false;
    this.loadSellers();
  }
}
