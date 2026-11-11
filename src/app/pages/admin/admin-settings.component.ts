import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container container-narrow">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-warning">Platform Maintenance</span>
            <h1>System Configuration</h1>
            <p class="text-xs text-secondary">Control commercial verification constraints, commission percentages, and demo environment resets.</p>
          </div>

          <div class="alert alert-success mb-4" *ngIf="successMessage">
            <app-icon name="check-circle" [size]="16"></app-icon>
            <span>{{ successMessage }}</span>
          </div>

          <!-- Configuration Form Card -->
          <div class="card form-card mb-6">
            <h3>Platform Parameters</h3>

            <div class="form-row mt-4">
              <div class="form-group">
                <label class="form-label" for="commission">GymPlate Retained Commission (%)</label>
                <input id="commission" type="number" class="form-control" [(ngModel)]="commissionPercent" />
                <span class="form-hint">Deducted from gross order value for verification and moderation maintenance.</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="flatDelivery">Standard Courier Flat Delivery (₱ PHP)</label>
                <input id="flatDelivery" type="number" class="form-control" [(ngModel)]="deliveryFee" />
                <span class="form-hint">Applied automatically to delivery fulfillment orders.</span>
              </div>
            </div>

            <div class="divider my-6"></div>

            <h3 class="mb-3">Verification Strictness</h3>
            <div class="toggle-list">
              <label class="settings-toggle-card">
                <div class="settings-toggle-icon">
                  <app-icon name="shield" [size]="18" color="var(--color-primary)"></app-icon>
                </div>
                <div class="settings-toggle-info">
                  <span class="settings-toggle-title">Require Valid Health Department Permit</span>
                  <span class="settings-toggle-desc">Block applicants who do not provide a municipal commercial food certificate.</span>
                </div>
                <div class="switch-control">
                  <input type="checkbox" [(ngModel)]="requireHealthPermit" />
                  <span class="switch-track"></span>
                </div>
              </label>

              <label class="settings-toggle-card">
                <div class="settings-toggle-icon">
                  <app-icon name="check-circle" [size]="18" color="var(--color-primary)"></app-icon>
                </div>
                <div class="settings-toggle-info">
                  <span class="settings-toggle-title">Automatic Caloric Density Range Sanity Check</span>
                  <span class="settings-toggle-desc">Flag meals with protein greater than 60g or fat under 2g for manual inspection.</span>
                </div>
                <div class="switch-control">
                  <input type="checkbox" [(ngModel)]="autoMacroValidation" />
                  <span class="switch-track"></span>
                </div>
              </label>
            </div>

            <div class="flex justify-end mt-6 pt-4 border-top">
              <button class="btn btn-primary" (click)="saveSettings()">
                <app-icon name="save" [size]="16"></app-icon>
                Save Configuration
              </button>
            </div>
          </div>

          <!-- Demo Reset Section -->
          <div class="card danger-card">
            <div class="flex items-start gap-4">
              <app-icon name="alert-triangle" [size]="24" color="var(--color-danger)"></app-icon>
              <div class="flex-1">
                <h3 class="text-danger">Reset Demonstration Database</h3>
                <p class="text-xs text-secondary mt-1">
                  Restore all initial users, orders, stock counts, and demo seller applications back to the factory state. Clears current browser localStorage modifications.
                </p>
                <button class="btn btn-danger btn-sm mt-4" (click)="resetDemoData()">
                  Reset All Mock Data to Default
                </button>
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
      max-width: var(--container-narrow);
      margin: 0 auto;
    }
    .form-card, .danger-card {
      padding: var(--space-8);
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
    }
    .danger-card {
      border-color: rgba(220, 53, 69, 0.3);
      background: #FFF5F5;
    }
    .text-danger {
      color: #991B1B;
    }
    .divider {
      height: 1px;
      background: var(--color-border);
    }
    .border-top {
      border-top: 1px solid var(--color-border);
    }
    .toggle-row {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
      cursor: pointer;
    }
    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .settings-toggle-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 18px;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;
    }
    .settings-toggle-card:hover {
      border-color: var(--color-primary);
      background: #FCFDFD;
    }
    .settings-toggle-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(22, 101, 52, 0.08);
      flex-shrink: 0;
    }
    .settings-toggle-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .settings-toggle-title {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--color-text);
      line-height: 1.35;
    }
    .settings-toggle-desc {
      font-size: 12px;
      color: var(--color-text-secondary);
      line-height: 1.45;
    }
    .switch-control {
      position: relative;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      flex-shrink: 0;
    }
    .switch-control input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      margin: 0;
      pointer-events: none;
    }
    .switch-track {
      width: 42px;
      height: 24px;
      background-color: #E2E8F0;
      border-radius: 9999px;
      position: relative;
      transition: background-color 0.2s ease, border-color 0.2s ease;
      border: 1px solid #CBD5E1;
      display: inline-block;
    }
    .switch-track::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      background-color: #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease;
    }
    .switch-control input[type="checkbox"]:checked + .switch-track {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }
    .switch-control input[type="checkbox"]:checked + .switch-track::after {
      transform: translateX(18px);
    }
    .switch-control input[type="checkbox"]:focus-visible + .switch-track {
      box-shadow: 0 0 0 3px rgba(22, 101, 52, 0.2);
    }
    .alert-success {
      background: var(--color-success-bg);
      color: #166534;
      padding: 10px 14px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
    }

    @media (max-width: 900px) {
      .admin-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
    }
  `]
})
export class AdminSettingsComponent {
  commissionPercent = 5;
  deliveryFee = 49;
  requireHealthPermit = true;
  autoMacroValidation = true;
  successMessage = '';

  constructor(private mockData: MockDataService) {}

  saveSettings() {
    this.successMessage = 'System parameters updated successfully.';
    setTimeout(() => this.successMessage = '', 3500);
  }

  resetDemoData() {
    if (confirm('Are you sure you want to restore the demonstration database to default factory settings?')) {
      this.mockData.resetToDefaults();
      alert('Mock data has been restored to default factory state.');
      window.location.reload();
    }
  }
}
