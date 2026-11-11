export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled';
export type FulfillmentType = 'pickup' | 'delivery';
export type PaymentMethod = 'cash_on_pickup' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'paid';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  sellerId: string;
  sellerName: string;
  businessId: string;
  businessName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  specialInstructions?: string;
  statusHistory: { status: OrderStatus; timestamp: Date; note?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  product: import('./product.model').Product;
  quantity: number;
  specialInstructions?: string;
}

export interface Cart {
  items: CartItem[];
  sellerId: string | null;
  businessName: string | null;
}
