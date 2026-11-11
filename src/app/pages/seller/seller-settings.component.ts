import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SellerSidebarComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container container-narrow">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-primary">Preferences & Kitchen Controls</span>
            <h1>Kitchen Settings</h1>
            <p class="text-xs text-secondary">Manage operational thresholds, notifications, and security options.</p>
          </div>

          <div class="alert alert-success mb-4" *ngIf="successMessage">
            <app-icon name="check-circle" [size]="16"></app-icon>
            <span>{{ successMessage }}</span>
          </div>

          <div class="card settings-card">
            <form (ngSubmit)="saveSettings()">
              <h3>Preparation & Capacity</h3>

              <div class="form-group mt-3">
                <label class="form-label" for="prepTime">Standard Meal Preparation Window</label>
                <select id="prepTime" class="form-control" [(ngModel)]="settings.prepWindow" name="prepWindow">
                  <option value="15-20 mins">15 - 20 minutes (Fast Casual / Bowls)</option>
                  <option value="25-35 mins">25 - 35 minutes (Made-to-Order Meal Prep)</option>
                  <option value="40-60 mins">40 - 60 minutes (Bulk Catering)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="orderLimit">Maximum Active Kitchen Orders</label>
                <input id="orderLimit" type="number" class="form-control" [(ngModel)]="settings.maxOrders" name="maxOrders" />
                <span class="form-hint">Automatically pauses marketplace availability if orders exceed kitchen capacity.</span>
              </div>

              <div class="divider my-6"></div>

              <h3 class="mb-3">Notifications & Alerts</h3>

              <div class="toggle-list">
                <label class="settings-toggle-card">
                  <div class="settings-toggle-icon">
                    <app-icon name="bell" [size]="18" color="var(--color-primary)"></app-icon>
                  </div>
                  <div class="settings-toggle-info">
                    <span class="settings-toggle-title">New Order Sound & Alert</span>
                    <span class="settings-toggle-desc">Sound an alert when a customer dispatches a new meal order.</span>
                  </div>
                  <div class="switch-control">
                    <input type="checkbox" [(ngModel)]="settings.orderAlerts" name="orderAlerts" />
                    <span class="switch-track"></span>
                  </div>
                </label>

                <label class="settings-toggle-card">
                  <div class="settings-toggle-icon">
                    <app-icon name="alert-circle" [size]="18" color="var(--color-primary)"></app-icon>
                  </div>
                  <div class="settings-toggle-info">
                    <span class="settings-toggle-title">Low Inventory Warning</span>
                    <span class="settings-toggle-desc">Receive a dashboard notification when any meal reaches 5 units or lower.</span>
                  </div>
                  <div class="switch-control">
                    <input type="checkbox" [(ngModel)]="settings.lowStockAlerts" name="lowStockAlerts" />
                    <span class="switch-track"></span>
                  </div>
                </label>
              </div>

              <div class="flex justify-end mt-6 pt-4 border-top">
                <button type="submit" class="btn btn-primary">
                  <app-icon name="save" [size]="15"></app-icon>
                  Save Settings
                </button>
              </div>
            </form>
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
    .settings-card {
      padding: var(--space-8);
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
    }
    .settings-card h3 {
      font-size: var(--font-size-sm);
      font-weight: 700;
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
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
    }
  `]
})
export class SellerSettingsComponent {
  settings = {
    prepWindow: '25-35 mins',
    maxOrders: 20,
    orderAlerts: true,
    lowStockAlerts: true
  };
  successMessage = '';

  saveSettings() {
    this.successMessage = 'Kitchen preferences saved successfully.';
    setTimeout(() => this.successMessage = '', 3000);
  }
}
