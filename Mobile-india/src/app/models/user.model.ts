export interface UserSession {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: 'buyer' | 'shopkeeper' | 'admin';
  shopId?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface SendOtpResponse {
  sessionId: string;
  channel: 'email' | 'sms' | 'whatsapp';
  email?: string;
  phone?: string;
  sentToEmail?: string; // Present when OTP was routed to user's registered email
  expiresInSeconds: number;
  delivered?: boolean;
  devOtp?: string;
}

export interface AuthVerifyResponse {
  token: string;
  refreshToken: string;
  user: UserSession;
}

export interface ShopRegistrationData {
  ownerName: string;
  email: string; // Unique business email
  phone: string; // Unique shop phone
  whatsapp?: string;
  shopName: string;
  address: string;
  locality: string;
  city: string;
  openHours?: string;
  image?: string;
  googleMapsUrl?: string;
}

export interface PhoneListing {
  id: string;
  customId?: string;
  brand: string;
  model: string;
  ram?: string;
  storage: string;
  color?: string;
  price: number;
  mrp: number;
  condition: 'Like New' | 'Excellent' | 'Good' | 'Fair' | string;
  batteryHealth?: number;
  billBoxAvailable: boolean;
  warranty?: string;
  shopId: string;
  shopName: string;
  shopLocality?: string;
  shopCity?: string;
  shopPhone?: string;
  shopWhatsapp?: string;
  images: string[];
  isSold: boolean;
  isFeatured?: boolean;
  viewsCount?: number;
  leadsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  shop?: any;
}

export interface CustomerLead {
  id: string;
  customId?: string;
  shopId: string;
  phoneId?: string;
  phoneModel: string;
  buyerName: string;
  buyerPhone: string;
  channel: 'whatsapp' | 'call';
  status: 'new' | 'contacted' | 'sold' | 'lost';
  createdAt: string;
}
