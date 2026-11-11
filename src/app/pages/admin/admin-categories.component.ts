import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Category } from '../../models';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container">
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-warning">Marketplace Taxonomy</span>
              <h1>Meal Categories Management</h1>
              <p class="text-xs text-secondary">Manage fitness meal classifications, search tags, and marketplace category filters.</p>
            </div>
            <button class="btn btn-primary btn-sm" (click)="openAddModal()">
              <app-icon name="plus" [size]="14"></app-icon>
              Add New Category
            </button>
          </div>

          <div class="card table-panel">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th class="text-center">Active in Filter</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of categories">
                    <td>
                      <strong class="text-xs font-semibold">{{ c.name }}</strong>
                    </td>
                    <td class="text-xs text-secondary">{{ c.description }}</td>
                    <td class="text-center">
                      <span class="badge" [class.badge-success]="c.isActive" [class.badge-neutral]="!c.isActive">
                        {{ c.isActive ? 'Active' : 'Hidden' }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button class="btn btn-ghost btn-sm" (click)="toggleActive(c)">
                        {{ c.isActive ? 'Hide' : 'Show' }}
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

    <!-- Add Category Modal -->
    <div class="modal-overlay" *ngIf="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Food Category</h3>
          <button class="modal-close" (click)="showModal = false">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="catName">Category Name *</label>
            <input id="catName" type="text" class="form-control" [(ngModel)]="newCat.name" placeholder="e.g. Keto Platters" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="catDesc">Description</label>
            <input id="catDesc" type="text" class="form-control" [(ngModel)]="newCat.description" placeholder="High fat, zero net carb meals" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showModal = false">Cancel</button>
          <button class="btn btn-primary" [disabled]="!newCat.name.trim()" (click)="saveCategory()">
            Create Category
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
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  showModal = false;
  newCat = { name: '', description: '' };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.categories = this.productService.getCategories();
  }

  toggleActive(cat: Category) {
    cat.isActive = !cat.isActive;
  }

  openAddModal() {
    this.newCat = { name: '', description: '' };
    this.showModal = true;
  }

  saveCategory() {
    if (!this.newCat.name.trim()) return;
    this.categories.push({
      id: 'cat-' + Date.now(),
      name: this.newCat.name,
      description: this.newCat.description,
      isActive: true
    });
    this.showModal = false;
  }
}
