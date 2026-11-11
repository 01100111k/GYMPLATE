import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SellerService } from '../../services/seller.service';
import { MockDataService } from '../../services/mock-data.service';
import { SellerApplication } from '../../models';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="wizard-page">
      <div class="wizard-container">
        <!-- Brand Header -->
        <div class="wizard-header text-center">
          <a routerLink="/" class="wizard-logo">
            <app-icon name="utensils" [size]="28" color="var(--color-primary)"></app-icon>
            <span class="logo-text">Gym<span class="logo-accent">Plate</span></span>
            <span class="wizard-badge">Seller Onboarding</span>
          </a>
          <h2>Kitchen Partner Registration</h2>
          <p class="wizard-sub">Complete our 5-step verification wizard to start publishing macro-conscious meals</p>
          <div class="wizard-nav-back mt-2">
            <a routerLink="/auth/register" class="text-xs text-secondary hover-underline flex items-center justify-center gap-1">
              <app-icon name="arrow-left" [size]="12"></app-icon>
              <span>Back to registration options</span>
            </a>
          </div>
        </div>

        <!-- Progress Stepper Indicator -->
        <div class="stepper-card card">
          <div class="stepper-track">
            <div
              class="step-item"
              *ngFor="let s of steps; let i = index"
              [class.completed]="currentStep > i + 1"
              [class.active]="currentStep === i + 1"
              (click)="goToStep(i + 1)"
            >
              <div class="step-circle">
                <app-icon name="check" [size]="14" *ngIf="currentStep > i + 1"></app-icon>
                <span *ngIf="currentStep <= i + 1">{{ i + 1 }}</span>
              </div>
              <span class="step-label">{{ s }}</span>
            </div>
          </div>
        </div>

        <!-- Alert messages -->
        <div class="alert alert-danger" *ngIf="errorMessage">
          <app-icon name="alert-circle" [size]="16"></app-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Main Wizard Card -->
        <div class="card wizard-content-card">
          <!-- STEP 1: Account Information -->
          <div *ngIf="currentStep === 1" class="step-content">
            <div class="step-title-box">
              <h3>Step 1: Account Credentials</h3>
              <p>Set up your login details for the GymPlate seller portal.</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="sellerEmail">Business / Login Email</label>
              <input
                id="sellerEmail"
                type="email"
                class="form-control"
                placeholder="kitchen@example.com"
                [(ngModel)]="step1.email"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="sellerPassword">Password</label>
                <div class="input-wrap">
                  <input
                    id="sellerPassword"
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control with-action"
                    placeholder="Min 6 characters"
                    [(ngModel)]="step1.password"
                    required
                  />
                  <button type="button" class="password-toggle" (click)="showPassword = !showPassword">
                    <app-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="16"></app-icon>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="sellerConfirmPassword">Confirm Password</label>
                <input
                  id="sellerConfirmPassword"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Repeat password"
                  [(ngModel)]="step1.confirmPassword"
                  required
                />
              </div>
            </div>

            <div class="demo-google-box">
              <span class="text-xs text-secondary">Quick Onboarding:</span>
              <button type="button" class="btn btn-secondary btn-sm" (click)="prefillDemoSeller()">
                <app-icon name="zap" [size]="14" color="var(--color-primary)"></app-icon>
                Fill with Demo Health Cafe Data
              </button>
            </div>
          </div>

          <!-- STEP 2: Personal Information -->
          <div *ngIf="currentStep === 2" class="step-content">
            <div class="step-title-box">
              <h3>Step 2: Business Owner Information</h3>
              <p>Provide contact information for the primary authorized representative.</p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="ownerFirstName">First Name</label>
                <input id="ownerFirstName" type="text" class="form-control" placeholder="Maria" [(ngModel)]="step2.firstName" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="ownerLastName">Last Name</label>
                <input id="ownerLastName" type="text" class="form-control" placeholder="Santos" [(ngModel)]="step2.lastName" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="ownerPhone">Direct Phone Number</label>
              <input id="ownerPhone" type="tel" class="form-control" placeholder="(555) 345-6789" [(ngModel)]="step2.phone" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="ownerAddress">Residential / Representative Street Address</label>
              <input id="ownerAddress" type="text" class="form-control" placeholder="123 Wellness Blvd" [(ngModel)]="step2.address" required />
            </div>

            <div class="form-row grid-3">
              <div class="form-group">
                <label class="form-label" for="ownerCity">City</label>
                <input id="ownerCity" type="text" class="form-control" placeholder="San Francisco" [(ngModel)]="step2.city" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="ownerState">State</label>
                <input id="ownerState" type="text" class="form-control" placeholder="CA" [(ngModel)]="step2.state" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="ownerZip">Zip Code</label>
                <input id="ownerZip" type="text" class="form-control" placeholder="94107" [(ngModel)]="step2.zipCode" required />
              </div>
            </div>
          </div>

          <!-- STEP 3: Business Information -->
          <div *ngIf="currentStep === 3" class="step-content">
            <div class="step-title-box">
              <h3>Step 3: Commercial Kitchen & Brand Details</h3>
              <p>Tell customers about your kitchen, operating hours, and macro philosophy.</p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="bizName">Kitchen / Brand Name</label>
                <input id="bizName" type="text" class="form-control" placeholder="FitFuel Kitchen" [(ngModel)]="step3.businessName" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="bizType">Business Classification</label>
                <select id="bizType" class="form-control" [(ngModel)]="step3.businessType">
                  <option value="Meal Prep & Health Food">Meal Prep & Health Food</option>
                  <option value="Commercial Restaurant">Commercial Restaurant</option>
                  <option value="Cloud / Ghost Kitchen">Cloud / Ghost Kitchen</option>
                  <option value="Health Cafe & Smoothies">Health Cafe & Smoothies</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="bizDesc">Brand Description</label>
              <textarea
                id="bizDesc"
                class="form-control"
                rows="3"
                placeholder="High-protein, clean whole foods prepared daily by certified culinary fitness nutritionists..."
                [(ngModel)]="step3.businessDescription"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="bizHours">Operating / Pickup Hours</label>
                <input id="bizHours" type="text" class="form-control" placeholder="Mon-Sat: 7:00 AM - 9:00 PM" [(ngModel)]="step3.operatingHours" />
              </div>
              <div class="form-group">
                <label class="form-label" for="bizPhone">Store Contact Phone</label>
                <input id="bizPhone" type="tel" class="form-control" placeholder="(555) 789-0123" [(ngModel)]="step3.businessPhone" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="bizAddress">Commercial Kitchen Street Address</label>
              <input id="bizAddress" type="text" class="form-control" placeholder="456 Fitness Way, Suite 100" [(ngModel)]="step3.businessAddress" />
            </div>

            <div class="form-row grid-3">
              <div class="form-group">
                <label class="form-label" for="bizCity">City</label>
                <input id="bizCity" type="text" class="form-control" placeholder="San Francisco" [(ngModel)]="step3.businessCity" />
              </div>
              <div class="form-group">
                <label class="form-label" for="bizState">State</label>
                <input id="bizState" type="text" class="form-control" placeholder="CA" [(ngModel)]="step3.businessState" />
              </div>
              <div class="form-group">
                <label class="form-label" for="bizZip">Zip Code</label>
                <input id="bizZip" type="text" class="form-control" placeholder="94107" [(ngModel)]="step3.businessZipCode" />
              </div>
            </div>
          </div>

          <!-- STEP 4: Document Uploads & Verification -->
          <div *ngIf="currentStep === 4" class="step-content">
            <div class="step-title-box">
              <h3>Step 4: Commercial Documents & Permits</h3>
              <p>Upload government-issued identification and your commercial sanitary/business permit.</p>
            </div>

            <!-- Government ID -->
            <div class="upload-item card">
              <div class="upload-header">
                <div>
                  <h4>1. Government-Issued Photo ID</h4>
                  <p class="text-xs text-secondary">Driver's License, Passport, or National Identification Card (Max 5MB)</p>
                </div>
                <span class="badge" [class.badge-success]="step4.governmentId" [class.badge-neutral]="!step4.governmentId">
                  {{ step4.governmentId ? 'File Attached' : 'Required' }}
                </span>
              </div>

              <div *ngIf="!step4.governmentId" class="drop-zone" (click)="simulateUpload('governmentId', 'Government_ID_Front.jpg')">
                <app-icon name="upload" [size]="24" color="var(--color-primary)"></app-icon>
                <span>Click to attach Government ID</span>
                <small class="text-tertiary">PDF, JPG, or PNG (Demo instant simulation)</small>
              </div>

              <div *ngIf="step4.governmentId" class="uploaded-file-row">
                <div class="flex items-center gap-2">
                  <app-icon name="file-text" [size]="18" color="var(--color-primary)"></app-icon>
                  <div>
                    <strong class="text-xs block">{{ step4.governmentId.name }}</strong>
                    <span class="text-xs text-secondary">Verified document preview ready</span>
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm text-danger" (click)="step4.governmentId = undefined">
                  <app-icon name="trash" [size]="14"></app-icon>
                  Remove
                </button>
              </div>
            </div>

            <!-- Business Permit -->
            <div class="upload-item card mt-4">
              <div class="upload-header">
                <div>
                  <h4>2. Health Dept. or Commercial Food Permit</h4>
                  <p class="text-xs text-secondary">Valid local health inspection or food establishment permit</p>
                </div>
                <span class="badge" [class.badge-success]="step4.businessPermit" [class.badge-neutral]="!step4.businessPermit">
                  {{ step4.businessPermit ? 'File Attached' : 'Required' }}
                </span>
              </div>

              <div *ngIf="!step4.businessPermit" class="drop-zone" (click)="simulateUpload('businessPermit', 'Commercial_Food_Permit_2026.pdf')">
                <app-icon name="upload" [size]="24" color="var(--color-primary)"></app-icon>
                <span>Click to attach Food Sanitation Permit</span>
                <small class="text-tertiary">PDF, JPG, or PNG (Demo instant simulation)</small>
              </div>

              <div *ngIf="step4.businessPermit" class="uploaded-file-row">
                <div class="flex items-center gap-2">
                  <app-icon name="file-text" [size]="18" color="var(--color-primary)"></app-icon>
                  <div>
                    <strong class="text-xs block">{{ step4.businessPermit.name }}</strong>
                    <span class="text-xs text-secondary">Commercial food license attached</span>
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm text-danger" (click)="step4.businessPermit = undefined">
                  <app-icon name="trash" [size]="14"></app-icon>
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 5: Review & Submit -->
          <div *ngIf="currentStep === 5" class="step-content">
            <div class="step-title-box">
              <h3>Step 5: Review & Submit Application</h3>
              <p>Please review your information carefully before submitting for administrator compliance review.</p>
            </div>

            <div class="review-box card">
              <div class="review-section">
                <span class="review-title">Login Credentials</span>
                <div class="review-row">
                  <span class="lbl">Account Email:</span>
                  <span class="val">{{ step1.email }}</span>
                </div>
              </div>

              <div class="review-section">
                <span class="review-title">Representative Information</span>
                <div class="review-row">
                  <span class="lbl">Name:</span>
                  <span class="val">{{ step2.firstName }} {{ step2.lastName }}</span>
                </div>
                <div class="review-row">
                  <span class="lbl">Phone:</span>
                  <span class="val">{{ step2.phone }}</span>
                </div>
                <div class="review-row">
                  <span class="lbl">Address:</span>
                  <span class="val">{{ step2.address }}, {{ step2.city }}, {{ step2.state }} {{ step2.zipCode }}</span>
                </div>
              </div>

              <div class="review-section">
                <span class="review-title">Commercial Kitchen Details</span>
                <div class="review-row">
                  <span class="lbl">Business Name:</span>
                  <span class="val"><strong>{{ step3.businessName }}</strong></span>
                </div>
                <div class="review-row">
                  <span class="lbl">Classification:</span>
                  <span class="val">{{ step3.businessType }}</span>
                </div>
                <div class="review-row">
                  <span class="lbl">Kitchen Address:</span>
                  <span class="val">{{ step3.businessAddress }}, {{ step3.businessCity }}, {{ step3.businessState }}</span>
                </div>
                <div class="review-row">
                  <span class="lbl">Hours:</span>
                  <span class="val">{{ step3.operatingHours }}</span>
                </div>
              </div>

              <div class="review-section">
                <span class="review-title">Attached Verification Files</span>
                <div class="review-row">
                  <span class="lbl">Government ID:</span>
                  <span class="val text-success">{{ step4.governmentId?.name || 'Not attached' }}</span>
                </div>
                <div class="review-row">
                  <span class="lbl">Food Sanitation Permit:</span>
                  <span class="val text-success">{{ step4.businessPermit?.name || 'Not attached' }}</span>
                </div>
              </div>
            </div>

            <div class="compliance-note">
              <app-icon name="info" [size]="16" color="var(--color-primary)"></app-icon>
              <p class="text-xs">
                By submitting this application, you declare that all nutritional data you post will be calculated truthfully and accurately. You agree that products cannot be listed until an Administrator verifies your commercial documentation.
              </p>
            </div>
          </div>

          <!-- Wizard Navigation Buttons -->
          <div class="wizard-actions">
            <button type="button" class="btn btn-secondary" *ngIf="currentStep > 1" (click)="prevStep()">
              <app-icon name="arrow-left" [size]="16"></app-icon>
              Back
            </button>
            <div class="spacer"></div>
            <button type="button" class="btn btn-primary" *ngIf="currentStep < 5" (click)="nextStep()">
              Continue
              <app-icon name="arrow-right" [size]="16"></app-icon>
            </button>
            <button type="button" class="btn btn-success" *ngIf="currentStep === 5" [disabled]="isSubmitting" (click)="submitApplication()">
              <span *ngIf="!isSubmitting">Submit Verification Application</span>
              <span *ngIf="isSubmitting" class="flex items-center gap-2">
                <span class="loading-spinner"></span> Submitting...
              </span>
            </button>
          </div>
        </div>

        <!-- Quick Access for Already Approved Seller -->
        <div class="approved-demo-shortcut text-center card mt-4">
          <p class="text-xs text-secondary">
            Testing existing workflows? Sign into the already-verified demonstration seller account:
          </p>
          <button class="btn btn-outline btn-sm mt-2" (click)="loginAsDemoSeller()">
            Sign In as Approved Seller (FitFuel Kitchen)
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-page {
      background: var(--color-bg-secondary);
      min-height: 100vh;
      padding: var(--space-8) var(--space-4);
    }
    .wizard-container {
      max-width: 680px;
      margin: 0 auto;
    }
    .wizard-header {
      margin-bottom: var(--space-6);
    }
    .wizard-logo {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text);
      text-decoration: none;
      margin-bottom: var(--space-2);
    }
    .logo-accent {
      color: var(--color-primary);
    }
    .wizard-badge {
      font-size: 10px;
      background: #FEF3C7;
      color: #92400E;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      margin-left: 6px;
    }
    .wizard-sub {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .stepper-card {
      padding: var(--space-4) var(--space-6);
      margin-bottom: var(--space-6);
      border: 1px solid var(--color-border);
    }
    .stepper-track {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      z-index: 2;
    }
    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-bg-secondary);
      border: 2px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xs);
      font-weight: 700;
      color: var(--color-text-secondary);
      transition: all var(--transition-fast);
    }
    .step-item.active .step-circle {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: white;
    }
    .step-item.completed .step-circle {
      border-color: var(--color-primary);
      background: var(--color-primary-light);
      color: var(--color-primary);
    }
    .step-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--color-text-secondary);
    }
    .step-item.active .step-label {
      color: var(--color-primary);
      font-weight: 700;
    }

    .wizard-content-card {
      padding: var(--space-8);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
    }
    .step-title-box {
      margin-bottom: var(--space-6);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-4);
    }
    .step-title-box h3 {
      font-size: var(--font-size-lg);
      margin-bottom: 2px;
    }
    .step-title-box p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .demo-google-box {
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .drop-zone {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-6);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      background: var(--color-bg-secondary);
      transition: all var(--transition-fast);
    }
    .drop-zone:hover {
      border-color: var(--color-primary);
      background: var(--color-primary-lighter);
    }
    .upload-item {
      padding: var(--space-4);
      border: 1px solid var(--color-border);
    }
    .upload-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);
    }
    .upload-header h4 {
      font-size: var(--font-size-sm);
    }
    .uploaded-file-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--color-primary-lighter);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius);
      border: 1px solid rgba(45, 90, 61, 0.2);
    }

    .review-box {
      padding: var(--space-4);
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      margin-bottom: var(--space-5);
    }
    .review-section {
      padding-bottom: var(--space-3);
      margin-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-border);
    }
    .review-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .review-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-primary);
      display: block;
      margin-bottom: 6px;
    }
    .review-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      margin-bottom: 4px;
    }
    .review-row .lbl {
      color: var(--color-text-secondary);
    }
    .compliance-note {
      display: flex;
      gap: var(--space-2);
      align-items: flex-start;
      background: #FFFBEB;
      border: 1px solid #FCD34D;
      padding: var(--space-3);
      border-radius: var(--radius);
      color: #92400E;
      margin-bottom: var(--space-4);
    }

    .wizard-actions {
      display: flex;
      align-items: center;
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid var(--color-border);
    }
    .spacer {
      flex: 1;
    }

    .input-wrap {
      position: relative;
    }
    .with-action {
      padding-right: 36px;
    }
    .password-toggle {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-secondary);
    }

    .approved-demo-shortcut {
      padding: var(--space-4);
      background: white;
      border: 1px solid var(--color-border);
    }

    @media (max-width: 600px) {
      .step-label {
        display: none;
      }
      .wizard-content-card {
        padding: var(--space-5);
      }
    }
  `]
})
export class SellerRegisterComponent {
  currentStep = 1;
  steps = ['Account', 'Personal', 'Business', 'Documents', 'Review'];
  showPassword = false;
  isSubmitting = false;
  errorMessage = '';

  step1 = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  step2 = {
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  };

  step3 = {
    businessName: '',
    businessType: 'Meal Prep & Health Food',
    businessDescription: '',
    operatingHours: 'Mon - Sat: 8:00 AM - 8:00 PM',
    businessPhone: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessZipCode: ''
  };

  step4: {
    governmentId?: { name: string; url: string; type: string };
    businessPermit?: { name: string; url: string; type: string };
  } = {};

  constructor(
    private authService: AuthService,
    private sellerService: SellerService,
    private mockData: MockDataService,
    private router: Router
  ) {}

  goToStep(step: number) {
    if (step < this.currentStep) {
      this.currentStep = step;
      this.errorMessage = '';
    } else if (this.validateCurrentStep()) {
      this.currentStep = step;
      this.errorMessage = '';
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      this.currentStep++;
      this.errorMessage = '';
    }
  }

  validateCurrentStep(): boolean {
    if (this.currentStep === 1) {
      if (!this.step1.email || !this.step1.password) {
        this.errorMessage = 'Please complete all email and password fields.';
        return false;
      }
      if (this.step1.password !== this.step1.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return false;
      }
      if (this.step1.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters.';
        return false;
      }
    } else if (this.currentStep === 2) {
      if (!this.step2.firstName || !this.step2.lastName || !this.step2.phone || !this.step2.address) {
        this.errorMessage = 'Please complete your personal name, phone, and address.';
        return false;
      }
    } else if (this.currentStep === 3) {
      if (!this.step3.businessName || !this.step3.businessAddress) {
        this.errorMessage = 'Please provide your kitchen brand name and commercial address.';
        return false;
      }
    } else if (this.currentStep === 4) {
      if (!this.step4.governmentId || !this.step4.businessPermit) {
        this.errorMessage = 'Please attach both your Government ID and Commercial Food Permit.';
        return false;
      }
    }
    return true;
  }

  simulateUpload(type: 'governmentId' | 'businessPermit', filename: string) {
    this.step4[type] = {
      name: filename,
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      type: 'image/jpeg'
    };
    this.errorMessage = '';
  }

  prefillDemoSeller() {
    this.step1.email = `kitchen_${Date.now()}@fitplate.demo`;
    this.step1.password = 'Seller123!';
    this.step1.confirmPassword = 'Seller123!';

    this.step2.firstName = 'Marcus';
    this.step2.lastName = 'Vance';
    this.step2.phone = '(555) 789-2234';
    this.step2.address = '88 Athletic Way';
    this.step2.city = 'San Francisco';
    this.step2.state = 'CA';
    this.step2.zipCode = '94105';

    this.step3.businessName = 'Apex Protein Kitchen';
    this.step3.businessType = 'Meal Prep & Health Food';
    this.step3.businessDescription = 'Specializing in lean bulk macro bowls, low-sodium keto platters, and cold-pressed protein smoothies.';
    this.step3.operatingHours = 'Mon-Sun: 7:00 AM - 9:00 PM';
    this.step3.businessPhone = '(555) 998-1122';
    this.step3.businessAddress = '100 Fitness Blvd, Suite 4B';
    this.step3.businessCity = 'San Francisco';
    this.step3.businessState = 'CA';
    this.step3.businessZipCode = '94105';

    this.step4.governmentId = { name: 'Marcus_Vance_DL_2026.jpg', url: 'demo', type: 'image/jpeg' };
    this.step4.businessPermit = { name: 'SF_Health_Permit_ApexKitchen.pdf', url: 'demo', type: 'application/pdf' };
  }

  submitApplication() {
    this.isSubmitting = true;

    setTimeout(() => {
      // 1. Create User account as seller
      const userRes = this.authService.register({
        email: this.step1.email,
        password: this.step1.password,
        firstName: this.step2.firstName,
        lastName: this.step2.lastName,
        phone: this.step2.phone,
        role: 'seller'
      });

      if (!userRes.success || !userRes.user) {
        this.isSubmitting = false;
        this.errorMessage = userRes.message;
        return;
      }

      // 2. Create SellerApplication with Pending status
      const application: SellerApplication = {
        id: 'app-' + Date.now(),
        userId: userRes.user.id,
        personalInfo: { ...this.step2 },
        businessInfo: {
          ...this.step3,
          businessEmail: this.step1.email
        },
        documents: {
          governmentId: this.step4.governmentId,
          businessPermit: this.step4.businessPermit
        },
        status: 'pending',
        submittedAt: new Date(),
        updatedAt: new Date()
      };

      this.sellerService.submitApplication(application);
      this.isSubmitting = false;

      // Navigate to seller pending status screen
      this.router.navigate(['/seller/pending']);
    }, 600);
  }

  loginAsDemoSeller() {
    const res = this.authService.login('seller@gymplate.com', 'Seller123!');
    if (res.success) {
      this.router.navigate(['/seller']);
    }
  }
}
