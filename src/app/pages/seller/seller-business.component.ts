import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../services/seller.service';
import { AuthService } from '../../services/auth.service';
import { Business } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-business',
  standalone: true,
  imports: [CommonModule, FormsModule, SellerSidebarComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container container-narrow" *ngIf="business">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-primary">Store Identity</span>
            <h1>Commercial Kitchen Profile</h1>
            <p class="text-xs text-secondary">Edits saved here immediately reflect on the public customer marketplace and official receipts.</p>
          </div>

          <div class="alert alert-success mb-4" *ngIf="successMessage">
            <app-icon name="check-circle" [size]="16"></app-icon>
            <span>{{ successMessage }}</span>
          </div>

          <div class="card form-card">
            <form (ngSubmit)="saveBusiness()">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="bName">Kitchen / Brand Name</label>
                  <input id="bName" type="text" class="form-control" [(ngModel)]="business.businessName" name="businessName" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="bType">Business Type</label>
                  <select id="bType" class="form-control" [(ngModel)]="business.businessType" name="businessType" required>
                    <option value="Meal Prep & Health Food">Meal Prep & Health Food</option>
                    <option value="Commercial Restaurant">Commercial Restaurant</option>
                    <option value="Cloud / Ghost Kitchen">Cloud / Ghost Kitchen</option>
                    <option value="Health Cafe & Smoothies">Health Cafe & Smoothies</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="bDesc">Brand Description</label>
                <textarea id="bDesc" class="form-control" rows="3" [(ngModel)]="business.description" name="description"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="bHours">Operating / Pickup Hours</label>
                  <input id="bHours" type="text" class="form-control" [(ngModel)]="business.operatingHours" name="operatingHours" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="bPhone">Store Phone</label>
                  <input id="bPhone" type="tel" class="form-control" [(ngModel)]="business.phone" name="phone" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="bAddress">Physical Kitchen Address</label>
                <input id="bAddress" type="text" class="form-control" [(ngModel)]="business.address" name="address" />
              </div>

              <div class="form-row grid-3">
                <div class="form-group">
                  <label class="form-label" for="bCity">City</label>
                  <input id="bCity" type="text" class="form-control" [(ngModel)]="business.city" name="city" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="bState">State</label>
                  <input id="bState" type="text" class="form-control" [(ngModel)]="business.state" name="state" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="bZip">Zip Code</label>
                  <input id="bZip" type="text" class="form-control" [(ngModel)]="business.zipCode" name="zipCode" />
                </div>
              </div>

              <div class="flex justify-between items-center flex-wrap gap-3 mt-6 pt-4 border-top">
                <span class="text-xs text-secondary">Verified Commercial Partner</span>
                <button type="submit" class="btn btn-primary" [disabled]="isSaving">
                  <app-icon name="save" [size]="16"></app-icon>
                  Save Business Changes
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
    .form-card {
      padding: var(--space-8);
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
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
export class SellerBusinessComponent implements OnInit {
  business: Business | undefined;
  isSaving = false;
  successMessage = '';

  constructor(
    private authService: AuthService,
    private sellerService: SellerService
  ) {}

  ngOnInit() {
    const user = this.authService.user();
    if (user) {
      this.business = this.sellerService.getBusiness(user.id);
    }
  }

  saveBusiness() {
    if (!this.business) return;
    this.isSaving = true;
    this.business.updatedAt = new Date();

    setTimeout(() => {
      this.sellerService.updateBusiness(this.business!);
      this.isSaving = false;
      this.successMessage = 'Business profile updated successfully. Changes are now live.';
      setTimeout(() => this.successMessage = '', 3500);
    }, 400);
  }
}
