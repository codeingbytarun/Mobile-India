export type PhoneCondition = 'Pristine' | 'Like New' | 'Good' | 'Fair';

export interface PhoneListing {
  id: string;
  brand: 'Apple' | 'Samsung' | 'OnePlus' | 'Xiaomi' | 'Vivo' | 'Realme' | 'Google' | 'Other';
  model: string;
  ram: string;
  storage: string;
  color: string;
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
