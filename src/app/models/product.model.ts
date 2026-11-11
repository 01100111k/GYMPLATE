export interface NutritionInfo {
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Product {
  id: string;
  sellerId: string;
  businessId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  nutrition: NutritionInfo;
  stock: number;
  isAvailable: boolean;
  isDisabled: boolean;
  disableReason?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isActive: boolean;
}
