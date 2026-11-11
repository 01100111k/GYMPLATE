import { Injectable, signal, computed } from '@angular/core';
import { Product, CartItem, Cart } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart = signal<Cart>({ items: [], sellerId: null, businessName: null });

  readonly cartItems = computed(() => this.cart().items);
  readonly itemCount = computed(() => this.cart().items.reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() => this.cart().items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0));
  readonly deliveryFee = computed(() => this.subtotal() > 0 ? 49 : 0);
  readonly serviceFee = computed(() => Math.round(this.subtotal() * 0.05 * 100) / 100);
  readonly total = computed(() => this.subtotal() + this.deliveryFee() + this.serviceFee());
  readonly currentSellerId = computed(() => this.cart().sellerId);
  readonly currentBusinessName = computed(() => this.cart().businessName);
  readonly isEmpty = computed(() => this.cart().items.length === 0);

  constructor() {
    this.loadCart();
  }

  addItem(product: Product, quantity: number = 1): { success: boolean; message: string } {
    const current = this.cart();
    // Check if adding from a different seller
    if (current.sellerId && current.sellerId !== product.sellerId) {
      return {
        success: false,
        message: `Your cart contains items from ${current.businessName}. Please complete or clear that order first. GymPlate groups orders by seller.`
      };
    }
    if (!product.isAvailable || product.stock <= 0) {
      return { success: false, message: 'This product is currently unavailable.' };
    }
    if (product.isDisabled) {
      return { success: false, message: 'This product has been disabled.' };
    }

    const items = [...current.items];
    const existingIndex = items.findIndex(i => i.productId === product.id);

    if (existingIndex >= 0) {
      const newQty = items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        return { success: false, message: `Only ${product.stock} available in stock.` };
      }
      items[existingIndex] = { ...items[existingIndex], quantity: newQty };
    } else {
      if (quantity > product.stock) {
        return { success: false, message: `Only ${product.stock} available in stock.` };
      }
      items.push({ productId: product.id, product, quantity });
    }

    this.cart.set({
      items,
      sellerId: product.sellerId,
      businessName: current.businessName || product.businessId // we'll set this properly
    });
    this.saveCart();
    return { success: true, message: `${product.name} added to cart.` };
  }

  updateQuantity(productId: string, quantity: number): void {
    const current = this.cart();
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const items = current.items.map(item =>
      item.productId === productId ? { ...item, quantity: Math.min(quantity, item.product.stock) } : item
    );
    this.cart.set({ ...current, items });
    this.saveCart();
  }

  removeItem(productId: string): void {
    const current = this.cart();
    const items = current.items.filter(i => i.productId !== productId);
    if (items.length === 0) {
      this.clearCart();
    } else {
      this.cart.set({ ...current, items });
      this.saveCart();
    }
  }

  clearCart(): void {
    this.cart.set({ items: [], sellerId: null, businessName: null });
    this.saveCart();
  }

  setBusinessName(name: string): void {
    const current = this.cart();
    this.cart.set({ ...current, businessName: name });
    this.saveCart();
  }

  private saveCart(): void {
    // Save minimal cart info (product IDs and quantities, not full objects)
    const cartData = {
      items: this.cart().items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      sellerId: this.cart().sellerId,
      businessName: this.cart().businessName
    };
    localStorage.setItem('gymplate_cart', JSON.stringify(cartData));
  }

  private loadCart(): void {
    // Cart will be rehydrated with full product data when products service is available
    const stored = localStorage.getItem('gymplate_cart');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // We'll store minimal data and rehydrate in the product service
        this.cart.set({
          items: [],
          sellerId: data.sellerId || null,
          businessName: data.businessName || null
        });
      } catch {
        this.clearCart();
      }
    }
  }

  rehydrateCart(products: Product[]): void {
    const stored = localStorage.getItem('gymplate_cart');
    if (!stored) return;
    try {
      const data = JSON.parse(stored);
      const items: CartItem[] = [];
      for (const savedItem of data.items || []) {
        const product = products.find(p => p.id === savedItem.productId);
        if (product && product.isAvailable && !product.isDisabled && product.stock > 0) {
          items.push({
            productId: savedItem.productId,
            product,
            quantity: Math.min(savedItem.quantity, product.stock)
          });
        }
      }
      this.cart.set({
        items,
        sellerId: data.sellerId || null,
        businessName: data.businessName || null
      });
    } catch {
      this.clearCart();
    }
  }
}
