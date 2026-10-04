export interface Shop {
  id: string;
  userId?: string;
  name: string;
  ownerName: string;
  email?: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  address: string;
  locality: string;
  city: string;
  phone: string;
  whatsapp: string;
  image: string;
  openHours: string;
  distanceKm: number;
  activeListingsCount: number;
  lat?: number;
  lng?: number;
  slug: string;
  googleMapsUrl?: string;
  createdAt?: string;
}

export interface ShopReview {
  id: string;
  shopId: string;
  buyerId?: string;
  buyerName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ShopQrResponse {
  qrCodeDataUrl: string;
  catalogUrl: string;
}
