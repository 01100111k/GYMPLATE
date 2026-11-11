import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { SellerService } from '../../services/seller.service';
import { AuthService } from '../../services/auth.service';
import { Product, Category } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SellerSidebarComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container container-narrow">
          <div class="page-header mb-6">
            <a routerLink="/seller/products" class="text-xs text-secondary mb-1 block">&larr; Back to Products</a>
            <h1>Add New Fitness Meal</h1>
            <p class="text-xs text-secondary">Publish a new recipe with exact macronutrient counts per measured serving.</p>
          </div>

          <!-- Pending Alert if not verified -->
          <div class="alert alert-danger mb-6" *ngIf="!isApproved()">
            <app-icon name="alert-triangle" [size]="18"></app-icon>
            <div>
              <strong>Publishing Locked</strong>
              <p class="text-xs mt-1">Your kitchen status is {{ sellerStatus() }}. You must be an Approved Seller to list products on GymPlate.</p>
            </div>
          </div>

          <div class="card form-card">
            <form (ngSubmit)="saveProduct()" #prodForm="ngForm">
              <!-- Basic Information -->
              <div class="section-divider">
                <span class="sec-title">1. Meal Details</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="name">Meal Name</label>
                <input
                  id="name"
                  type="text"
                  class="form-control"
                  placeholder="e.g. Grass-Fed Beef & Quinoa Power Bowl"
                  [(ngModel)]="product.name"
                  name="name"
                  required
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="category">Category</label>
                  <select id="category" class="form-control" [(ngModel)]="product.category" name="category" required>
                    <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="price">Price (₱ PHP)</label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="1"
                    class="form-control"
                    placeholder="12.99"
                    [(ngModel)]="product.price"
                    name="price"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="desc">Description & Ingredients</label>
                <textarea
                  id="desc"
                  class="form-control"
                  rows="3"
                  placeholder="Describe the meal ingredients, preparation method, and dietary profile..."
                  [(ngModel)]="product.description"
                  name="description"
                  required
                ></textarea>
              </div>

              <!-- Image Upload & Preview -->
              <div class="section-divider mt-6">
                <span class="sec-title">2. Food Photography (Upload Image)</span>
              </div>

              <div class="image-upload-section">
                <!-- Hidden file input -->
                <input
                  #fileInput
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  (change)="onFileSelected($event)"
                  style="display: none;"
                />

                <!-- When NO image is uploaded: Dropzone -->
                <div
                  *ngIf="!product.imageUrl"
                  class="dropzone-box"
                  [class.is-dragover]="isDragging"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onFileDrop($event)"
                  (click)="fileInput.click()"
                >
                  <div class="dropzone-icon">
                    <app-icon name="upload" [size]="28" color="var(--color-primary)"></app-icon>
                  </div>
                  <div class="dropzone-content">
                    <p class="dropzone-title">Click to upload meal photo</p>
                    <p class="dropzone-subtitle">or drag and drop your photo file here</p>
                    <span class="dropzone-hint">PNG, JPG, or WEBP &bull; Max 5MB</span>
                  </div>
                </div>

                <!-- When image is uploaded: Preview & Actions -->
                <div *ngIf="product.imageUrl" class="uploaded-image-card">
                  <div class="image-preview-frame">
                    <img [src]="product.imageUrl" alt="Meal Preview" />
                  </div>
                  <div class="uploaded-image-details">
                    <div class="image-status-badge">
                      <app-icon name="check" [size]="14" color="var(--color-primary)"></app-icon>
                      <span>Photo uploaded successfully</span>
                    </div>
                    <p class="image-filename" *ngIf="uploadedFileName">{{ uploadedFileName }}</p>
                    <p class="text-xs text-secondary mt-1">This photo will be displayed to customers across GymPlate.</p>
                    <div class="uploaded-image-actions mt-3">
                      <button type="button" class="btn btn-outline btn-sm" (click)="fileInput.click()">
                        <app-icon name="upload" [size]="14"></app-icon>
                        Change Photo
                      </button>
                      <button type="button" class="btn btn-ghost btn-sm text-danger" (click)="removeImage(fileInput)">
                        <app-icon name="trash" [size]="14"></app-icon>
                        Remove Photo
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Inline error message if any -->
                <div *ngIf="uploadError" class="image-error-alert mt-2">
                  <app-icon name="alert-circle" [size]="15" color="#dc2626"></app-icon>
                  <span>{{ uploadError }}</span>
                </div>
              </div>

              <!-- Macronutrient Facts -->
              <div class="section-divider mt-6">
                <span class="sec-title">3. Nutrition Facts per Serving (Seller-Provided)</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="servingSize">Measured Serving Size</label>
                <input
                  id="servingSize"
                  type="text"
                  class="form-control"
                  placeholder="e.g. 1 bowl (420g) or 1 wrap (280g)"
                  [(ngModel)]="product.nutrition.servingSize"
                  name="servingSize"
                  required
                />
              </div>

              <div class="nutrition-inputs-grid">
                <div class="form-group highlight-input">
                  <label class="form-label" for="protein">Protein (g)</label>
                  <input
                    id="protein"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="40"
                    [(ngModel)]="product.nutrition.protein"
                    name="protein"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="calories">Calories (kcal)</label>
                  <input
                    id="calories"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="450"
                    [(ngModel)]="product.nutrition.calories"
                    name="calories"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="carbs">Carbohydrates (g)</label>
                  <input
                    id="carbs"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="35"
                    [(ngModel)]="product.nutrition.carbs"
                    name="carbs"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="fat">Total Fat (g)</label>
                  <input
                    id="fat"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="12"
                    [(ngModel)]="product.nutrition.fat"
                    name="fat"
                    required
                  />
                </div>
              </div>

              <!-- Stock & Availability -->
              <div class="section-divider mt-6">
                <span class="sec-title">4. Initial Stock & Status</span>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="stock">Available Stock Units</label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="25"
                    [(ngModel)]="product.stock"
                    name="stock"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Marketplace Availability</label>
                  <div class="mt-2">
                    <label class="switch-control">
                      <input type="checkbox" [(ngModel)]="product.isAvailable" name="isAvailable" />
                      <span class="switch-track"></span>
                      <span class="text-xs font-medium">Publish dish as immediately available to order</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Form Buttons -->
              <div class="flex justify-between items-center flex-wrap gap-3 mt-8 pt-4 border-top">
                <a routerLink="/seller/products" class="btn btn-secondary">Cancel</a>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="prodForm.invalid || !isApproved() || isSaving"
                >
                  <app-icon name="plus-circle" [size]="15" *ngIf="!isSaving"></app-icon>
                  <span *ngIf="!isSaving">Publish Meal to Marketplace</span>
                  <span *ngIf="isSaving" class="flex items-center gap-2">
                    <span class="loading-spinner"></span> Saving...
                  </span>
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

    .section-divider {
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-4);
    }
    .sec-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-primary);
    }

    .image-upload-section {
      margin-bottom: var(--space-4);
    }
    .dropzone-box {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-6) var(--space-4);
      background: var(--color-bg-secondary);
      text-align: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
    }
    .dropzone-box:hover, .dropzone-box.is-dragover {
      border-color: var(--color-primary);
      background: rgba(22, 101, 52, 0.04);
    }
    .dropzone-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-full);
      background: white;
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-1);
    }
    .dropzone-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text);
      margin: 0;
    }
    .dropzone-subtitle {
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
      margin: 2px 0 6px 0;
    }
    .dropzone-hint {
      display: inline-block;
      font-size: 11px;
      color: var(--color-text-tertiary);
      background: white;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
    }
    .uploaded-image-card {
      display: flex;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      align-items: center;
    }
    .image-preview-frame {
      width: 140px;
      height: 105px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      flex-shrink: 0;
      border: 1px solid var(--color-border);
      background: white;
    }
    .image-preview-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .uploaded-image-details {
      flex: 1;
      min-width: 0;
    }
    .image-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-primary);
      background: rgba(22, 101, 52, 0.08);
      padding: 3px 8px;
      border-radius: var(--radius-full);
    }
    .image-filename {
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--color-text);
      margin: 6px 0 0 0;
      word-break: break-all;
    }
    .uploaded-image-actions {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .image-error-alert {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-xs);
      color: #dc2626;
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
    }

    .nutrition-inputs-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-3);
    }
    .highlight-input .form-control {
      border-color: var(--color-primary);
    }

    .border-top {
      border-top: 1px solid var(--color-border);
    }

    .alert-danger {
      background: var(--color-danger-bg);
      color: #991B1B;
      padding: 12px 14px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    @media (max-width: 900px) {
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .uploaded-image-card {
        flex-direction: column;
        align-items: flex-start;
      }
      .image-preview-frame {
        width: 100%;
        height: 180px;
      }
      .nutrition-inputs-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AddProductComponent implements OnInit {
  categories: Category[] = [];
  isSaving = false;
  isDragging = false;
  uploadError = '';
  uploadedFileName = '';

  product: Product = {
    id: '',
    sellerId: '',
    businessId: '',
    name: '',
    description: '',
    category: 'Protein Bowls',
    price: 250.00,
    imageUrl: '',
    nutrition: {
      servingSize: '1 bowl (400g)',
      calories: 450,
      protein: 40,
      carbs: 35,
      fat: 12
    },
    stock: 25,
    isAvailable: true,
    isDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private sellerService: SellerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categories = this.productService.getCategories();
    const user = this.authService.user();
    if (user) {
      this.product.sellerId = user.id;
      const biz = this.sellerService.getBusiness(user.id);
      this.product.businessId = biz?.id || 'biz-1';
    }
  }

  isApproved(): boolean {
    const user = this.authService.user();
    return user ? this.sellerService.isApproved(user.id) : false;
  }

  sellerStatus(): string {
    const user = this.authService.user();
    return user ? (this.sellerService.getSellerStatus(user.id) || 'pending') : 'pending';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  private processFile(file: File) {
    this.uploadError = '';
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      this.uploadError = 'Please upload a valid image file (PNG, JPG, or WEBP).';
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.uploadError = 'Image size must be 5MB or less.';
      return;
    }

    this.uploadedFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.product.imageUrl = reader.result as string;
    };
    reader.onerror = () => {
      this.uploadError = 'Failed to read image file. Please try again.';
    };
    reader.readAsDataURL(file);
  }

  removeImage(fileInput?: HTMLInputElement) {
    this.product.imageUrl = '';
    this.uploadedFileName = '';
    this.uploadError = '';
    if (fileInput) {
      fileInput.value = '';
    }
  }

  saveProduct() {
    if (!this.isApproved()) {
      alert('Your kitchen must be verified and approved by an Administrator to add products.');
      return;
    }

    if (!this.product.imageUrl) {
      this.uploadError = 'Please upload a photo of your meal before publishing.';
      return;
    }

    this.isSaving = true;
    this.product.id = 'prod-' + Date.now();
    this.product.createdAt = new Date();
    this.product.updatedAt = new Date();

    setTimeout(() => {
      this.productService.addProduct(this.product);
      this.isSaving = false;
      this.router.navigate(['/seller/products']);
    }, 400);
  }
}
