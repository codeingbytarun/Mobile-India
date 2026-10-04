export type PhoneCondition = 'Pristine' | 'Like New' | 'Good' | 'Fair';

export interface PhoneListing {
  id: string;
  brand: string;
  model: string;
  ram?: string;
  storage: string;
  color?: string;
  price: number;
  mrp: number;
  condition: PhoneCondition;
  batteryHealth?: number; // e.g. 89% for iPhones
  billBoxAvailable: boolean;
  warranty: string; // e.g. '30-Day Testing Warranty'
  shopId: string;
  shopName: string;
  shopLocality: string;
  shopCity: string;
  shopPhone: string;
  shopWhatsapp: string;
  shopDistanceKm: number;
  images: string[];
  isSold: boolean;
  isFeatured?: boolean;
  viewsCount: number;
  leadsCount: number;
  createdAt: string;
  updatedAt?: string;
  shop?: {
    id: string;
    name: string;
    ownerName?: string;
    locality: string;
    city: string;
    phone: string;
    whatsapp: string;
    verified: boolean;
    rating: number;
    distanceKm?: number;
    googleMapsUrl?: string;
  };
}

export interface PhoneFilterState {
  searchQuery: string;
  city: string;
  brand: string | null;
  minPrice: number;
  maxPrice: number;
  condition: PhoneCondition | null;
  storage: string | null;
  maxDistanceKm: number;
  onlyBillBox: boolean;
  onlyWithWarranty: boolean;
}

export interface ComparePhoneItem {
  id: string;
  model: string;
  brand: string;
  storage: string;
  condition: PhoneCondition;
  price: number;
  mrp: number;
  batteryHealth?: number;
  billBoxAvailable: boolean;
  warranty: string;
  images: string[];
  shopId: string;
  shopName: string;
  shopLocality: string;
  shopDistanceKm: number;
  shopPhone: string;
  shopWhatsapp: string;
}
