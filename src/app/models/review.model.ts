export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  rating: number;
  ratingLabel?: string;
  comment: string;
  createdAt: Date;
}
