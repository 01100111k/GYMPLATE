import { Injectable } from '@angular/core';
import { Order, OrderItem, OrderStatus, FulfillmentType, PaymentMethod, CartItem } from '../models';
import { MockDataService } from './mock-data.service';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private validTransitions: Record<OrderStatus, OrderStatus[]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['out_for_delivery', 'completed', 'cancelled'],
    'out_for_delivery': ['delivered'],
    'delivered': ['completed'],
    'completed': [],
    'cancelled': []
  };

  constructor(
    private mockData: MockDataService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  getOrders(): Order[] {
    return this.mockData.getOrders();
  }

  getOrder(id: string): Order | undefined {
    return this.mockData.getOrder(id);
  }

  getOrderByNumber(orderNumber: string): Order | undefined {
    return this.mockData.getOrders().find(o => o.orderNumber === orderNumber);
  }

  getCustomerOrders(customerId: string): Order[] {
    return this.mockData.getOrdersByCustomerId(customerId);
  }

  getSellerOrders(sellerId: string): Order[] {
    return this.mockData.getOrdersBySellerId(sellerId);
  }

  createOrder(params: {
    fulfillmentType: FulfillmentType;
    paymentMethod: PaymentMethod;
    specialInstructions?: string;
    deliveryAddress?: string;
  }): { success: boolean; message: string; order?: Order } {
    const user = this.authService.user();
    if (!user) return { success: false, message: 'Please log in to place an order.' };

    const cartItems = this.cartService.cartItems();
    if (cartItems.length === 0) return { success: false, message: 'Your cart is empty.' };

    const sellerId = this.cartService.currentSellerId();
    if (!sellerId) return { success: false, message: 'Invalid cart state.' };

    const business = this.mockData.getBusinessBySellerId(sellerId);
    const seller = this.mockData.getUser(sellerId);

    // Validate stock
    for (const item of cartItems) {
      const product = this.mockData.getProduct(item.productId);
      if (!product || product.stock < item.quantity) {
        return { success: false, message: `${item.product.name} is no longer available in the requested quantity.` };
      }
    }

    const orderItems: OrderItem[] = cartItems.map(item => ({
      id: 'oi-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      productId: item.productId,
      productName: item.product.name,
      productImageUrl: item.product.imageUrl,
      quantity: item.quantity,
      unitPrice: item.product.price,
      subtotal: item.product.price * item.quantity,
      nutrition: {
        calories: item.product.nutrition.calories * item.quantity,
        protein: item.product.nutrition.protein * item.quantity,
        carbs: item.product.nutrition.carbs * item.quantity,
        fat: item.product.nutrition.fat * item.quantity
      }
    }));

    const subtotal = this.cartService.subtotal();
    const deliveryFee = params.fulfillmentType === 'delivery' ? 35 : 0;
    const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;

    const order: Order = {
      id: 'order-' + Date.now(),
      orderNumber: this.generateOrderNumber(),
      customerId: user.id,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      customerPhone: user.phone,
      customerAddress: params.deliveryAddress || user.address,
      sellerId: sellerId,
      sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'Unknown',
      businessId: business?.id || '',
      businessName: business?.businessName || this.cartService.currentBusinessName() || 'Unknown',
      items: orderItems,
      subtotal,
      deliveryFee,
      serviceFee,
      total: subtotal + deliveryFee + serviceFee,
      fulfillmentType: params.fulfillmentType,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      specialInstructions: params.specialInstructions,
      statusHistory: [{ status: 'pending' as OrderStatus, timestamp: new Date(), note: 'Order placed' }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Deduct stock
    for (const item of cartItems) {
      const product = this.mockData.getProduct(item.productId);
      if (product) {
        const updated = {
          ...product,
          stock: product.stock - item.quantity,
          isAvailable: (product.stock - item.quantity) > 0,
          updatedAt: new Date()
        };
        this.mockData.updateProduct(updated);
      }
    }

    this.mockData.addOrder(order);

    // Add notification for seller
    this.mockData.addNotification({
      id: 'notif-' + Date.now(),
      userId: sellerId,
      type: 'order',
      title: 'New Order Received',
      message: `Order ${order.orderNumber} from ${order.customerName}`,
      isRead: false,
      link: '/seller/orders',
      createdAt: new Date()
    });

    this.cartService.clearCart();
    return { success: true, message: 'Order placed successfully!', order };
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): { success: boolean; message: string } {
    const order = this.mockData.getOrder(orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const allowed = this.validTransitions[order.status];
    if (!allowed.includes(newStatus)) {
      return { success: false, message: `Cannot change status from "${this.formatStatus(order.status)}" to "${this.formatStatus(newStatus)}".` };
    }

    const updated: Order = {
      ...order,
      status: newStatus,
      statusHistory: [...order.statusHistory, { status: newStatus, timestamp: new Date(), note }],
      paymentStatus: (newStatus === 'completed' || newStatus === 'delivered') ? 'paid' : order.paymentStatus,
      updatedAt: new Date()
    };

    this.mockData.updateOrder(updated);

    // Notify customer
    this.mockData.addNotification({
      id: 'notif-' + Date.now(),
      userId: order.customerId,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order ${order.orderNumber} is now ${this.formatStatus(newStatus)}.`,
      isRead: false,
      link: '/customer/orders',
      createdAt: new Date()
    });

    return { success: true, message: `Order status updated to "${this.formatStatus(newStatus)}".` };
  }

  cancelOrder(orderId: string, reason?: string): { success: boolean; message: string } {
    const order = this.mockData.getOrder(orderId);
    if (!order) return { success: false, message: 'Order not found.' };
    if (!['pending', 'confirmed'].includes(order.status)) {
      return { success: false, message: 'This order can no longer be cancelled.' };
    }

    // Restore stock
    for (const item of order.items) {
      const product = this.mockData.getProduct(item.productId);
      if (product) {
        this.mockData.updateProduct({
          ...product,
          stock: product.stock + item.quantity,
          isAvailable: true,
          updatedAt: new Date()
        });
      }
    }

    return this.updateOrderStatus(orderId, 'cancelled', reason || 'Order cancelled');
  }

  getValidTransitions(currentStatus: OrderStatus, fulfillmentType: FulfillmentType): OrderStatus[] {
    const transitions = this.validTransitions[currentStatus] || [];
    if (fulfillmentType === 'pickup') {
      // Pickup orders go ready -> completed (no delivery steps)
      return transitions.filter(s => s !== 'out_for_delivery' && s !== 'delivered');
    }
    if (fulfillmentType === 'delivery' && currentStatus === 'ready') {
      return transitions.filter(s => s !== 'completed');
    }
    return transitions;
  }

  formatStatus(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready for Pickup',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  }

  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const count = this.mockData.getOrders().length + 1;
    return `GP-${year}-${count.toString().padStart(3, '0')}`;
  }
}
