import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';
import { CustomerNavComponent } from '../../shared/components/customer-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerNavComponent, PublicFooterComponent, IconComponent],
  template: `
    <app-customer-nav></app-customer-nav>

    <main class="page-content profile-page">
      <div class="container container-narrow">
        <div class="page-header mb-6">
          <h1>Account Profile</h1>
          <p>Manage your delivery details, contact coordinates, and fitness platform preferences.</p>
        </div>

        <div class="alert alert-success" *ngIf="successMessage">
          <app-icon name="check-circle" [size]="16"></app-icon>
          <span>{{ successMessage }}</span>
        </div>

        <div class="card profile-card" *ngIf="user">
          <!-- User Meta Header -->
          <div class="user-profile-header">
            <div class="avatar-large">
              {{ initials() }}
            </div>
            <div class="user-meta-info">
              <h2>{{ user.firstName }} {{ user.lastName }}</h2>
              <span class="user-email text-xs text-secondary">{{ user.email }}</span>
              <div class="status-row mt-2">
                <span class="badge badge-success">Active Customer</span>
                <span class="badge badge-neutral">Member since {{ user.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>

          <div class="divider my-6"></div>

          <!-- Edit Profile Form -->
          <form (ngSubmit)="saveProfile()" class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="firstName">First Name</label>
                <input id="firstName" type="text" class="form-control" [(ngModel)]="user.firstName" name="firstName" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="lastName">Last Name</label>
                <input id="lastName" type="text" class="form-control" [(ngModel)]="user.lastName" name="lastName" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="phone">Phone Number</label>
                <input id="phone" type="tel" class="form-control" [(ngModel)]="user.phone" name="phone" />
              </div>
              <div class="form-group">
                <label class="form-label" for="email">Account Email <small class="text-secondary">(Read Only)</small></label>
                <input id="email" type="email" class="form-control" [value]="user.email" disabled />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="address">Primary Delivery Street Address</label>
              <input id="address" type="text" class="form-control" [(ngModel)]="user.address" name="address" placeholder="e.g. 742 Evergreen Terrace" />
            </div>

            <div class="form-row grid-3">
              <div class="form-group">
                <label class="form-label" for="city">City</label>
                <input id="city" type="text" class="form-control" [(ngModel)]="user.city" name="city" />
              </div>
              <div class="form-group">
                <label class="form-label" for="state">State</label>
                <input id="state" type="text" class="form-control" [(ngModel)]="user.state" name="state" />
              </div>
              <div class="form-group">
                <label class="form-label" for="zipCode">Zip Code</label>
                <input id="zipCode" type="text" class="form-control" [(ngModel)]="user.zipCode" name="zipCode" />
              </div>
            </div>

            <div class="flex justify-between items-center mt-6 pt-4 border-top">
              <button type="submit" class="btn btn-primary" [disabled]="isSaving">
                <app-icon name="save" [size]="16"></app-icon>
                <span>Save Profile Changes</span>
              </button>
              <button type="button" class="btn btn-outline text-danger" (click)="logout()">
                <app-icon name="log-out" [size]="16"></app-icon>
                Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .profile-page {
      background: var(--color-bg-secondary);
      min-height: 85vh;
    }
    .profile-card {
      padding: var(--space-8);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: white;
    }
    .user-profile-header {
      display: flex;
      align-items: center;
      gap: var(--space-6);
    }
    .avatar-large {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-meta-info h2 {
      font-size: var(--font-size-xl);
      margin-bottom: 2px;
    }
    .status-row {
      display: flex;
      gap: var(--space-2);
    }
    .divider {
      height: 1px;
      background: var(--color-border);
    }
    .my-6 {
      margin-top: var(--space-6);
      margin-bottom: var(--space-6);
    }
    .border-top {
      border-top: 1px solid var(--color-border);
    }
    .alert-success {
      background: var(--color-success-bg);
      color: #166534;
      border: 1px solid rgba(40, 167, 69, 0.3);
      padding: 10px 14px;
      border-radius: var(--radius);
      margin-bottom: var(--space-4);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
    }
  `]
})
export class CustomerProfileComponent implements OnInit {
  user: User | null = null;
  isSaving = false;
  successMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const u = this.authService.user();
    if (u) {
      this.user = { ...u };
    }
  }

  initials(): string {
    if (!this.user) return 'U';
    return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
  }

  saveProfile() {
    if (!this.user) return;
    this.isSaving = true;
    this.successMessage = '';

    setTimeout(() => {
      this.authService.updateProfile(this.user!);
      this.isSaving = false;
      this.successMessage = 'Your profile information has been saved successfully.';
      setTimeout(() => this.successMessage = '', 3500);
    }, 400);
  }

  logout() {
    this.authService.logout();
  }
}
