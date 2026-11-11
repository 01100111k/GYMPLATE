import { Injectable, signal, computed } from '@angular/core';
import { Product, Category } from '../models';
import { MockDataService } from './mock-data.service';

export interface ProductFilters {
  search: string;
  category: string;
  sortBy: 'name' | 'price_asc' | 'price_desc' | 'calories_asc' | 'calories_desc' | 'protein_desc';
  quickFilter: 'all' | 'high_protein' | 'low_calorie' | 'under_500';
  minCalories?: number;
  maxCalories?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private mockData: MockDataService) {}

  getProducts(): Product[] {
    return this.mockData.getProducts().filter(p => !p.isDisabled);
  }

  getAllProducts(): Product[] {
    return this.mockData.getProducts();
  }

  getProduct(id: string): Product | undefined {
    return this.mockData.getProduct(id);
  }

  getProductsBySeller(sellerId: string): Product[] {
    return this.mockData.getProductsBySellerId(sellerId);
  }

  getAvailableProducts(): Product[] {
    return this.mockData.getProducts().filter(p => p.isAvailable && !p.isDisabled && p.stock > 0);
  }

  getCategories(): Category[] {
    return this.mockData.getCategories();
  }

  addProduct(product: Product): void {
    this.mockData.addProduct(product);
  }

  updateProduct(product: Product): void {
    this.mockData.updateProduct(product);
  }

  deleteProduct(id: string): void {
    this.mockData.deleteProduct(id);
  }

  filterProducts(products: Product[], filters: ProductFilters): Product[] {
    let result = [...products];

    // Search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
      );
    }

    // Category
    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category);
    }

    // Quick filters
    switch (filters.quickFilter) {
      case 'high_protein':
        result = result.filter(p => p.nutrition.protein >= 25);
        break;
      case 'low_calorie':
        result = result.filter(p => p.nutrition.calories <= 350);
        break;
      case 'under_500':
        result = result.filter(p => p.nutrition.calories < 500);
        break;
    }

    // Custom calorie range
    if (filters.minCalories !== undefined) {
      result = result.filter(p => p.nutrition.calories >= filters.minCalories!);
    }
    if (filters.maxCalories !== undefined) {
      result = result.filter(p => p.nutrition.calories <= filters.maxCalories!);
    }

    // Sort
    switch (filters.sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'calories_asc':
        result.sort((a, b) => a.nutrition.calories - b.nutrition.calories);
        break;
      case 'calories_desc':
        result.sort((a, b) => b.nutrition.calories - a.nutrition.calories);
        break;
      case 'protein_desc':
        result.sort((a, b) => b.nutrition.protein - a.nutrition.protein);
        break;
    }

    return result;
  }
}
