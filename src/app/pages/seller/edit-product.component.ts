import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, Category } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SellerSidebarComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container container-narrow" *ngIf="product">
          <div class="page-header mb-6">
            <a routerLink="/seller/products" class="text-xs text-secondary mb-1 block">&larr; Back to Catalog</a>
            <h1>Edit Fitness Meal: {{ product.name }}</h1>
            <p class="text-xs text-secondary">Update pricing, real-time inventory count, and serving nutritional values.</p>
          </div>

          <div class="card form-card">
            <form (ngSubmit)="saveProduct()">
              <div class="form-group">
                <label class="form-label" for="editName">Meal Name</label>
                <input id="editName" type="text" class="form-control" [(ngModel)]="product.name" name="name" required />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="editCategory">Category</label>
                  <select id="editCategory" class="form-control" [(ngModel)]="product.category" name="category" required>
                    <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="editPrice">Price (₱ PHP)</label>
                  <input id="editPrice" type="number" step="0.01" min="1" class="form-control" [(ngModel)]="product.price" name="price" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="editDesc">Description & Preparation</label>
                <textarea id="editDesc" class="form-control" rows="3" [(ngModel)]="product.description" name="description" required></textarea>
              </div>

              <!-- Image Edit (Upload) -->
              <div class="form-group my-4">
                <label class="form-label">Meal Photography</label>
                <input
                  #editFileInput
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  (change)="onFileSelected($event)"
                  style="display: none;"
                />

                <!-- When NO image exists: Dropzone -->
                <div
                  *ngIf="!product.imageUrl"
                  class="dropzone-box"
                  [class.is-dragover]="isDragging"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onFileDrop($event)"
                  (click)="editFileInput.click()"
                >
                  <div class="dropzone-icon">
                    <app-icon name="upload" [size]="26" color="var(--color-primary)"></app-icon>
                  </div>
                  <div>
                    <p class="dropzone-title">Click to upload meal photo</p>
                    <p class="dropzone-subtitle">or drag and drop your photo file here</p>
                    <span class="dropzone-hint">PNG, JPG, or WEBP &bull; Max 5MB</span>
                  </div>
                </div>

                <!-- When image exists: Preview & Replace/Remove -->
                <div *ngIf="product.imageUrl" class="uploaded-image-card">
                  <div class="image-preview-frame">
                    <img [src]="product.imageUrl" [alt]="product.name" />
                  </div>
                  <div class="uploaded-image-details">
                    <div class="image-status-badge">
                      <app-icon name="check" [size]="14" color="var(--color-primary)"></app-icon>
                      <span>Photo Attached</span>
                    </div>
                    <p class="image-filename" *ngIf="uploadedFileName">{{ uploadedFileName }}</p>
                    <p class="text-xs text-secondary mt-1">Displayed in customer marketplace, cart & receipts</p>
                    <div class="uploaded-image-actions mt-3">
                      <button type="button" class="btn btn-outline btn-sm" (click)="editFileInput.click()">
                        <app-icon name="upload" [size]="14"></app-icon>
                        Change Photo
                      </button>
                      <button type="button" class="btn btn-ghost btn-sm text-danger" (click)="removeImage(editFileInput)">
                        <app-icon name="trash" [size]="14"></app-icon>
                        Remove Photo
                      </button>
                    </div>
                  </div>
                </div>

                <div *ngIf="uploadError" class="image-error-alert mt-2">
                  <app-icon name="alert-circle" [size]="15" color="#dc2626"></app-icon>
                  <span>{{ uploadError }}</span>
                </div>
              </div>

              <!-- Nutrition -->
              <div class="form-group">
                <label class="form-label" for="editServing">Serving Size</label>
                <input id="editServing" type="text" class="form-control" [(ngModel)]="product.nutrition.servingSize" name="servingSize" required />
              </div>

              <div class="nutrition-inputs-grid">
                <div class="form-group">
                  <label class="form-label" for="editProtein">Protein (g)</label>
                  <input id="editProtein" type="number" class="form-control" [(ngModel)]="product.nutrition.protein" name="protein" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="editCalories">Calories</label>
                  <input id="editCalories" type="number" class="form-control" [(ngModel)]="product.nutrition.calories" name="calories" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="editCarbs">Carbs (g)</label>
                  <input id="editCarbs" type="number" class="form-control" [(ngModel)]="product.nutrition.carbs" name="carbs" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="editFat">Fat (g)</label>
                  <input id="editFat" type="number" class="form-control" [(ngModel)]="product.nutrition.fat" name="fat" required />
                </div>
              </div>

              <!-- Stock & Availability -->
              <div class="form-row mt-4">
                <div class="form-group">
                  <label class="form-label" for="editStock">Inventory Stock Units</label>
                  <input id="editStock" type="number" min="0" class="form-control" [(ngModel)]="product.stock" name="stock" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Availability</label>
                  <div class="mt-2">
                    <label class="switch-control">
                      <input type="checkbox" [(ngModel)]="product.isAvailable" name="isAvailable" />
                      <span class="switch-track"></span>
                      <span class="text-xs font-medium">Live in customer marketplace</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="flex justify-between items-center flex-wrap gap-3 mt-6 pt-4 border-top">
                <a routerLink="/seller/products" class="btn btn-secondary">Cancel</a>
                <button type="submit" class="btn btn-primary" [disabled]="isSaving">
                  <app-icon name="save" [size]="16"></app-icon>
                  Save Changes
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
      width: 44px;
      height: 44px;
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
    .border-top {
      border-top: 1px solid var(--color-border);
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
export class EditProductComponent implements OnInit {
  product: Product | undefined;
  categories: Category[] = [];
  isSaving = false;
  isDragging = false;
  uploadError = '';
  uploadedFileName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.categories = this.productService.getCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.productService.getProduct(id);
      if (found) {
        this.product = { ...found, nutrition: { ...found.nutrition } };
      }
    }
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
      if (this.product) {
        this.product.imageUrl = reader.result as string;
      }
    };
    reader.onerror = () => {
      this.uploadError = 'Failed to read image file. Please try again.';
    };
    reader.readAsDataURL(file);
  }

  removeImage(fileInput?: HTMLInputElement) {
    if (this.product) {
      this.product.imageUrl = '';
    }
    this.uploadedFileName = '';
    this.uploadError = '';
    if (fileInput) {
      fileInput.value = '';
    }
  }

  saveProduct() {
    if (!this.product) return;
    if (!this.product.imageUrl) {
      this.uploadError = 'Please upload a photo of your meal before saving changes.';
      return;
    }

    this.isSaving = true;
    this.product.updatedAt = new Date();

    setTimeout(() => {
      this.productService.updateProduct(this.product!);
      this.isSaving = false;
      this.router.navigate(['/seller/products']);
    }, 400);
  }
}
