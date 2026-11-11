import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderItem, Report, ReportReason } from '../../models';
import { ReportService } from '../../services/report.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-report-issue-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-content report-modal-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-title">
            <app-icon name="alert-triangle" [size]="20" color="#B45309"></app-icon>
            <h3>Report Food or Order Issue</h3>
          </div>
          <button class="modal-close" (click)="close()" aria-label="Close modal">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Scrollable Modal Body -->
        <div class="modal-body">
          <!-- Submission Confirmation View -->
          <div class="submission-confirmation-box text-center py-6" *ngIf="submittedReport">
            <div class="conf-icon-circle mx-auto mb-4">
              <app-icon name="check" [size]="32" color="white"></app-icon>
            </div>
            <h4 class="conf-title">Report Successfully Submitted</h4>
            <div class="ref-badge my-3">
              <span>Reference No:</span>
              <strong>{{ submittedReport.referenceNumber }}</strong>
            </div>
            <p class="text-xs text-secondary max-w-md mx-auto mb-4">
              Your report has been logged and forwarded to <strong>{{ submittedReport.businessName }}</strong> and GymPlate Quality Moderation. You can track resolution status directly in your orders or reports dashboard.
            </p>
            <div class="flex justify-center gap-3">
              <button class="btn btn-primary btn-sm" (click)="close()">
                Done / Return to Orders
              </button>
            </div>
          </div>

          <!-- Report Form View -->
          <div *ngIf="!submittedReport">
            <!-- Order Context Bar -->
            <div class="order-context-bar mb-4">
              <div class="context-item">
                <span class="ctx-label">Order Number:</span>
                <span class="ctx-val font-mono">{{ order?.orderNumber }}</span>
              </div>
              <div class="context-item">
                <span class="ctx-label">Kitchen Partner:</span>
                <span class="ctx-val">{{ order?.businessName }}</span>
              </div>
              <div class="context-item">
                <span class="ctx-label">Fulfillment:</span>
                <span class="ctx-val capitalize">{{ order?.fulfillmentType }}</span>
              </div>
            </div>

            <!-- Affected Food Item Selector -->
            <div class="form-group mb-4">
              <label class="form-label" for="foodItemSelect">
                Affected Food Item <span class="text-danger">*</span>
              </label>
              <select
                id="foodItemSelect"
                class="form-control"
                [(ngModel)]="selectedProductId"
                (change)="onProductChange()"
              >
                <option value="" disabled>-- Select purchased food item --</option>
                <option *ngFor="let itm of order?.items" [value]="itm.productId">
                  {{ itm.productName }} ({{ itm.quantity }}x) - {{ itm.unitPrice | currency:'PHP':'symbol' }}
                </option>
              </select>
            </div>

            <!-- Report Reason Dropdown -->
            <div class="form-group mb-4">
              <label class="form-label" for="reportReasonSelect">
                Primary Reason for Report <span class="text-danger">*</span>
              </label>
              <select
                id="reportReasonSelect"
                class="form-control"
                [(ngModel)]="selectedReason"
              >
                <option value="" disabled>-- Choose a category --</option>
                <option *ngFor="let r of reportReasons" [value]="r">
                  {{ r }}
                </option>
              </select>
            </div>

            <!-- Detailed Description -->
            <div class="form-group mb-4">
              <label class="form-label" for="reportDesc">
                Detailed Issue Description <span class="text-danger">*</span>
              </label>
              <textarea
                id="reportDesc"
                class="form-control report-desc-textarea"
                rows="4"
                [(ngModel)]="description"
                placeholder="Describe specifically what was wrong (e.g. food temperature, packaging damage, foreign object, unsealed container, incorrect nutrition label)..."
              ></textarea>
              <span class="form-hint">
                Minimum 10 characters required. Be as clear and specific as possible.
              </span>
            </div>

            <!-- Evidence Photo Upload (Multiple) -->
            <div class="form-group mb-4">
              <div class="flex justify-between items-center mb-1">
                <label class="form-label mb-0">Evidence Photos (Optional)</label>
                <span class="text-xs text-secondary">Up to 4 images, &le;5MB each</span>
              </div>

              <!-- Upload Drag / Click Box -->
              <div
                class="evidence-upload-zone"
                (click)="fileInput.click()"
                *ngIf="evidencePreviews.length < 4"
              >
                <input
                  #fileInput
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style="display: none"
                  (change)="onFilesSelected($event)"
                />
                <app-icon name="upload" [size]="24" color="var(--color-primary)"></app-icon>
                <div class="upload-zone-text">
                  <strong>Click to upload photos</strong> of food, packaging, or labels
                  <span class="block text-xs text-secondary mt-1">PNG, JPG, or WEBP</span>
                </div>
              </div>

              <!-- Upload Previews Grid -->
              <div class="evidence-grid mt-3" *ngIf="evidencePreviews.length > 0">
                <div class="evidence-item" *ngFor="let img of evidencePreviews; let i = index">
                  <div class="evidence-thumb">
                    <img [src]="img.dataUrl" [alt]="img.name" />
                    <button
                      type="button"
                      class="remove-photo-btn"
                      (click)="removePhoto(i)"
                      title="Remove this photo"
                    >
                      <app-icon name="x" [size]="14"></app-icon>
                    </button>
                  </div>
                  <span class="evidence-name" [title]="img.name">{{ img.name }}</span>
                </div>
              </div>

              <div class="alert alert-danger mt-2 py-2 text-xs" *ngIf="uploadError">
                <app-icon name="alert-circle" [size]="14"></app-icon>
                <span>{{ uploadError }}</span>
              </div>
            </div>

            <!-- Error Banner -->
            <div class="alert alert-danger mb-4" *ngIf="errorMessage">
              <app-icon name="alert-circle" [size]="16"></app-icon>
              <span>{{ errorMessage }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer" *ngIf="!submittedReport">
          <button class="btn btn-secondary" (click)="close()" [disabled]="isSubmitting">
            Cancel
          </button>
          <button
            class="btn btn-danger-action"
            (click)="submitReport()"
            [disabled]="isSubmitting || !selectedProductId || !selectedReason || description.trim().length < 10"
          >
            <app-icon name="alert-triangle" [size]="16" *ngIf="!isSubmitting"></app-icon>
            <span *ngIf="!isSubmitting">Submit Report</span>
            <span *ngIf="isSubmitting">Submitting...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .report-modal-card {
      max-width: 580px;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .order-context-bar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      background: var(--color-bg-secondary);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      font-size: 11.5px;
      flex-wrap: wrap;
    }
    .context-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .ctx-label {
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .ctx-val {
      color: var(--color-text);
      font-weight: 600;
    }

    .report-desc-textarea {
      resize: vertical;
      min-height: 90px;
      font-size: 13px;
      line-height: 1.45;
    }

    .evidence-upload-zone {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: 18px;
      text-align: center;
      background: #F8FAFC;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all var(--transition-fast);
    }
    .evidence-upload-zone:hover {
      border-color: var(--color-primary);
      background: rgba(22, 101, 52, 0.04);
    }
    .upload-zone-text {
      font-size: 12px;
      color: var(--color-text);
    }

    .evidence-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .evidence-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .evidence-thumb {
      position: relative;
      width: 100%;
      height: 72px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--color-border);
      background: #F1F5F9;
    }
    .evidence-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .remove-photo-btn {
      position: absolute;
      top: 3px;
      right: 3px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(17, 24, 39, 0.85);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .remove-photo-btn:hover {
      background: #DC2626;
    }
    .evidence-name {
      font-size: 10.5px;
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-danger-action {
      background: #DC2626;
      color: white;
      border: 1px solid #B91C1C;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn-danger-action:hover:not(:disabled) {
      background: #B91C1C;
    }
    .btn-danger-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Confirmation UI */
    .conf-icon-circle {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #166534;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .conf-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--color-text);
      margin: 0;
    }
    .ref-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #EFF6FF;
      color: #1E40AF;
      border: 1px solid #BFDBFE;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
    }

    @media (max-width: 480px) {
      .evidence-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ReportIssueModalComponent implements OnInit, OnChanges {
  private reportService = inject(ReportService);

  @Input() isOpen = false;
  @Input() order: Order | null | undefined = null;
  @Input() item: OrderItem | null | undefined = null;

  @Output() closeEvent = new EventEmitter<void>();
  @Output() reportSubmitted = new EventEmitter<Report>();

  reportReasons: ReportReason[] = [
    'Food quality issue',
    'Incorrect or missing food item',
    'Food arrived damaged or spilled',
    'Food does not match its description',
    'Incorrect nutritional information',
    'Food safety or hygiene concern',
    'Other'
  ];

  selectedProductId = '';
  selectedReason: ReportReason | '' = '';
  description = '';
  evidencePreviews: { name: string; dataUrl: string }[] = [];

  uploadError = '';
  errorMessage = '';
  isSubmitting = false;
  submittedReport: Report | null = null;

  ngOnInit() {
    this.syncInitialItem();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item'] || changes['order'] || changes['isOpen']) {
      this.syncInitialItem();
    }
  }

  private syncInitialItem() {
    if (this.item) {
      this.selectedProductId = this.item.productId;
    } else if (this.order && this.order.items.length > 0 && !this.selectedProductId) {
      this.selectedProductId = this.order.items[0].productId;
    }
  }

  onProductChange() {
    // Keep selectedProductId in sync
  }

  onFilesSelected(event: Event) {
    this.uploadError = '';
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    for (const file of files) {
      if (this.evidencePreviews.length >= 4) {
        this.uploadError = 'You can upload up to 4 evidence images.';
        break;
      }
      if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
        this.uploadError = `${file.name} is not a supported image (PNG, JPG, WEBP).`;
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = `${file.name} exceeds 5MB size limit.`;
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.evidencePreviews.push({
          name: file.name,
          dataUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removePhoto(index: number) {
    this.evidencePreviews.splice(index, 1);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent) {
    this.close();
  }

  close() {
    this.resetForm();
    this.closeEvent.emit();
  }

  resetForm() {
    this.selectedProductId = '';
    this.selectedReason = '';
    this.description = '';
    this.evidencePreviews = [];
    this.uploadError = '';
    this.errorMessage = '';
    this.isSubmitting = false;
    this.submittedReport = null;
  }

  submitReport() {
    this.errorMessage = '';
    if (!this.order) {
      this.errorMessage = 'Order information is missing.';
      return;
    }
    if (!this.selectedProductId) {
      this.errorMessage = 'Please choose the affected meal item.';
      return;
    }
    if (!this.selectedReason) {
      this.errorMessage = 'Please specify the primary reason for this report.';
      return;
    }
    if (!this.description || this.description.trim().length < 10) {
      this.errorMessage = 'Please provide a detailed description (minimum 10 characters).';
      return;
    }

    const matchedItem = this.order.items.find(i => i.productId === this.selectedProductId);
    const prodName = matchedItem ? matchedItem.productName : 'Delivered Item';
    const prodImg = matchedItem ? matchedItem.productImageUrl : '';

    this.isSubmitting = true;

    const res = this.reportService.submitReport({
      orderId: this.order.id,
      orderNumber: this.order.orderNumber,
      sellerId: this.order.sellerId,
      businessName: this.order.businessName,
      productId: this.selectedProductId,
      productName: prodName,
      productImageUrl: prodImg,
      reason: this.selectedReason as ReportReason,
      description: this.description.trim(),
      evidenceImages: this.evidencePreviews.map(e => e.dataUrl)
    });

    this.isSubmitting = false;

    if (!res.success || !res.report) {
      this.errorMessage = res.message;
      return;
    }

    this.submittedReport = res.report;
    this.reportSubmitted.emit(res.report);
  }
}
