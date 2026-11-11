import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-warning">Platform Governance</span>
            <h1>Registered Customers</h1>
            <p class="text-xs text-secondary">Customer accounts and order activities. Credential confidentiality enforced (passwords never displayed).</p>
          </div>

          <!-- Search Filter -->
          <div class="card filter-bar mb-6">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="16" class="search-icon"></app-icon>
              <input
                type="text"
                class="form-control"
                placeholder="Search by customer name, email address, or phone..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterCustomers()"
              />
            </div>
          </div>

          <!-- Customer Table -->
          <div class="card table-panel">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th class="text-center">Orders Placed</th>
                    <th class="text-center">Total Spent</th>
                    <th class="text-center">Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of filteredCustomers">
                    <td>
                      <strong class="text-xs block">{{ c.firstName }} {{ c.lastName }}</strong>
                      <small class="text-tertiary">Joined {{ c.createdAt | date:'shortDate' }}</small>
                    </td>
                    <td class="text-xs">{{ c.email }}</td>
                    <td class="text-xs text-secondary">{{ c.phone || 'N/A' }}</td>
                    <td class="text-center font-bold text-xs">{{ getCustomerOrderCount(c.id) }}</td>
                    <td class="text-center font-semibold text-xs text-primary">{{ getCustomerTotalSpent(c.id) | currency:'PHP':'symbol' }}</td>
                    <td class="text-center">
                      <span class="badge" [class.badge-success]="c.accountStatus === 'active'" [class.badge-danger]="c.accountStatus === 'suspended'">
                        {{ c.accountStatus === 'active' ? 'Active' : 'Suspended' }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button
                        *ngIf="c.accountStatus === 'active'"
                        class="btn btn-outline btn-sm text-danger"
                        (click)="openModal(c, 'suspend')"
                      >
                        Suspend
                      </button>
                      <button
                        *ngIf="c.accountStatus === 'suspended'"
                        class="btn btn-success btn-sm"
                        (click)="openModal(c, 'reactivate')"
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

    <!-- Modal for Customer Status Action -->
    <div class="modal-overlay" *ngIf="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modalAction === 'suspend' ? 'Suspend Customer Account' : 'Reactivate Customer Account' }}</h3>
          <button class="modal-close" (click)="showModal = false">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-xs text-secondary mb-3">
            Target Customer: <strong>{{ selectedCustomer?.firstName }} {{ selectedCustomer?.lastName }}</strong> ({{ selectedCustomer?.email }})
          </p>
          <div class="form-group">
            <label class="form-label" for="customerReason">Reason for Suspension / Reactivation *</label>
            <textarea
              id="customerReason"
              class="form-control"
              rows="3"
              placeholder="e.g. Terms of service violation, fraudulent chargeback activity..."
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
export class AdminCustomersComponent implements OnInit {
  customers: User[] = [];
  filteredCustomers: User[] = [];
  searchQuery = '';

  showModal = false;
  selectedCustomer: User | null = null;
  modalAction: 'suspend' | 'reactivate' = 'suspend';
  actionReason = '';

  constructor(
    private adminService: AdminService,
    private mockData: MockDataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customers = this.adminService.getCustomers();
    this.filterCustomers();
  }

  filterCustomers() {
    this.filteredCustomers = this.customers.filter(c =>
      !this.searchQuery ||
      c.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.phone.includes(this.searchQuery)
    );
  }

  getCustomerOrderCount(customerId: string): number {
    return this.mockData.getOrdersByCustomerId(customerId).length;
  }

  getCustomerTotalSpent(customerId: string): number {
    return this.mockData.getOrdersByCustomerId(customerId)
      .reduce((sum, o) => sum + o.total, 0);
  }

  openModal(customer: User, action: 'suspend' | 'reactivate') {
    this.selectedCustomer = customer;
    this.modalAction = action;
    this.actionReason = '';
    this.showModal = true;
  }

  confirmAction() {
    if (!this.selectedCustomer || !this.actionReason.trim()) return;
    const admin = this.authService.user();
    const adminId = admin?.id || 'admin-1';

    if (this.modalAction === 'suspend') {
      this.adminService.suspendUser(this.selectedCustomer.id, adminId, this.actionReason);
    } else {
      this.adminService.reactivateUser(this.selectedCustomer.id, adminId, this.actionReason);
    }

    this.showModal = false;
    this.loadCustomers();
  }
}
