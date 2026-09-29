import { Injectable, signal, computed } from '@angular/core';
import { PhoneListing, PhoneFilterState, PhoneCondition } from '../models/phone.model';
import { Shop } from '../models/shop.model';

export interface UserSession {
  role: 'buyer' | 'shopkeeper';
  name: string;
  phone: string;
  shopId?: string; // set if shopkeeper
}

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  // Cities supported
  readonly availableCities = ['Jaipur', 'Delhi NCR', 'Mumbai', 'Bengaluru'];

  // Current selected city
  readonly currentCity = signal<string>('Jaipur');

  // User Auth State
  readonly currentUser = signal<UserSession | null>(this.loadUserSession());

  // Cart State (Array of Phone IDs)
  readonly cart = signal<string[]>(this.loadCart());

  // Auth Modal State for inquiries / actions
  readonly isAuthModalOpen = signal<boolean>(false);
  readonly pendingInquiry = signal<{ phone: PhoneListing; channel: 'whatsapp' | 'call' } | null>(null);

  // Registered local shops in Jaipur
  readonly shops = signal<Shop[]>([
    {
      id: 'shop_01',
      name: 'Sharma Telecom',
      ownerName: 'Rajesh Sharma',
      verified: true,
      rating: 4.9,
      reviewsCount: 142,
      address: 'Shop 14, Main Market, Malviya Nagar',
      locality: 'Malviya Nagar',
      city: 'Jaipur',
      phone: '9829012345',
      whatsapp: '919829012345',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      openHours: '10:00 AM - 9:30 PM',
      distanceKm: 1.2,
      activeListingsCount: 5,
      lat: 26.8530,
      lng: 75.8050,
      slug: 'sharma-telecom',
      googleMapsUrl: 'https://maps.google.com/?q=Sharma+Telecom+Malviya+Nagar+Jaipur'
    },
    {
      id: 'shop_02',
      name: 'Apex Mobile Hub',
      ownerName: 'Sunil Goyal',
      verified: true,
      rating: 4.7,
      reviewsCount: 89,
      address: 'Shop 22, AC Market, Raja Park',
      locality: 'Raja Park',
      city: 'Jaipur',
      phone: '9829098765',
      whatsapp: '919829098765',
      image: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=600&auto=format&fit=crop&q=80',
      openHours: '10:30 AM - 9:00 PM',
      distanceKm: 3.2,
      activeListingsCount: 4,
      lat: 26.8920,
      lng: 75.8280,
      slug: 'apex-mobile-hub',
      googleMapsUrl: 'https://maps.google.com/?q=Apex+Mobile+Hub+AC+Market+Raja+Park+Jaipur'
    },
    {
      id: 'shop_03',
      name: 'Royal Phone Care',
      ownerName: 'Amit Saini',
      verified: true,
      rating: 4.8,
      reviewsCount: 110,
      address: 'Plot 5, Near Metro Pillar 140, Mansarovar',
      locality: 'Mansarovar',
      city: 'Jaipur',
      phone: '9829033321',
      whatsapp: '919829033321',
      image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600&auto=format&fit=crop&q=80',
      openHours: '10:00 AM - 9:00 PM',
      distanceKm: 4.5,
      activeListingsCount: 3,
      lat: 26.8620,
      lng: 75.7680,
      slug: 'royal-phone-care',
      googleMapsUrl: 'https://maps.google.com/?q=Royal+Phone+Care+Mansarovar+Jaipur'
    },
    {
      id: 'shop_04',
      name: 'City Cellular',
      ownerName: 'Vikram Choudhary',
      verified: false,
      rating: 4.6,
      reviewsCount: 65,
      address: 'Shop 8, Basement, Gaurav Tower, Malviya Nagar',
      locality: 'Malviya Nagar',
      city: 'Jaipur',
      phone: '9829044455',
      whatsapp: '919829044455',
      image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80',
      openHours: '11:00 AM - 10:00 PM',
      distanceKm: 0.8,
      activeListingsCount: 3,
      lat: 26.8510,
      lng: 75.8030,
      slug: 'city-cellular',
      googleMapsUrl: 'https://maps.google.com/?q=City+Cellular+Gaurav+Tower+Malviya+Nagar+Jaipur'
    }
  ]);

  // Inventory of pre-owned phones
  readonly phones = signal<PhoneListing[]>([
    {
      id: 'ph_01',
      brand: 'Apple',
      model: 'iPhone 13',
      ram: '4GB',
      storage: '128GB',
      color: 'Midnight Blue',
      price: 34999,
      mrp: 59900,
      condition: 'Like New',
      batteryHealth: 89,
      billBoxAvailable: true,
      warranty: '30-Day Testing Warranty',
      shopId: 'shop_01',
      shopName: 'Sharma Telecom',
      shopLocality: 'Malviya Nagar',
      shopCity: 'Jaipur',
      shopPhone: '9829012345',
      shopWhatsapp: '919829012345',
      shopDistanceKm: 1.2,
      images: [
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&auto=format&fit=crop&q=80'
      ],
      isSold: false,
      isFeatured: true,
      viewsCount: 184,
      leadsCount: 19,
      createdAt: '2026-03-18'
    },
    {
      id: 'ph_02',
      brand: 'Apple',
      model: 'iPhone 13',
      ram: '4GB',
      storage: '128GB',
      color: 'Starlight White',
      price: 33500,
      mrp: 59900,
      condition: 'Good',
      batteryHealth: 84,
      billBoxAvailable: false,
      warranty: '15-Day Shop Warranty',
      shopId: 'shop_02',
      shopName: 'Apex Mobile Hub',
      shopLocality: 'Raja Park',
      shopCity: 'Jaipur',
      shopPhone: '9829098765',
      shopWhatsapp: '919829098765',
      shopDistanceKm: 3.2,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
      ],
      isSold: false,
      isFeatured: false,
      viewsCount: 112,
      leadsCount: 11,
      createdAt: '2026-03-19'
    },
    {
      id: 'ph_03',
      brand: 'OnePlus',
      model: '11R 5G',
      ram: '16GB',
      storage: '256GB',
      color: 'Galactic Silver',
      price: 26500,
      mrp: 44999,
      condition: 'Pristine',
      batteryHealth: 96,
      billBoxAvailable: true,
      warranty: '45-Day Shop Warranty',
      shopId: 'shop_01',
      shopName: 'Sharma Telecom',
      shopLocality: 'Malviya Nagar',
      shopCity: 'Jaipur',
      shopPhone: '9829012345',
      shopWhatsapp: '919829012345',
      shopDistanceKm: 1.2,
      images: [
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80'
      ],
      isSold: false,
      isFeatured: true,
      viewsCount: 142,
      leadsCount: 16,
      createdAt: '2026-03-20'
    },
    {
      id: 'ph_04',
      brand: 'Samsung',
      model: 'Galaxy S21 FE 5G',
      ram: '8GB',
      storage: '128GB',
      color: 'Lavender',
      price: 22999,
      mrp: 49999,
      condition: 'Like New',
      batteryHealth: 91,
      billBoxAvailable: true,
      warranty: '30-Day Testing Warranty',
      shopId: 'shop_03',
      shopName: 'Royal Phone Care',
      shopLocality: 'Mansarovar',
      shopCity: 'Jaipur',
      shopPhone: '9829033321',
      shopWhatsapp: '919829033321',
      shopDistanceKm: 4.5,
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'
      ],
      isSold: false,
      isFeatured: false,
      viewsCount: 95,
      leadsCount: 8,
      createdAt: '2026-03-21'
    },
    {
      id: 'ph_05',
      brand: 'Google',
      model: 'Pixel 7',
      ram: '8GB',
      storage: '128GB',
      color: 'Snow White',
      price: 27999,
      mrp: 59999,
      condition: 'Pristine',
      batteryHealth: 95,
      billBoxAvailable: true,
      warranty: '30-Day Testing Warranty',
      shopId: 'shop_04',
      shopName: 'City Cellular',
      shopLocality: 'Malviya Nagar',
      shopCity: 'Jaipur',
      shopPhone: '9829044455',
      shopWhatsapp: '919829044455',
      shopDistanceKm: 0.8,
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
      ],
      isSold: false,
      isFeatured: true,
      viewsCount: 160,
      leadsCount: 14,
      createdAt: '2026-03-21'
    },
    {
      id: 'ph_06',
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      ram: '6GB',
      storage: '128GB',
      color: 'Deep Purple',
      price: 64999,
      mrp: 129900,
      condition: 'Pristine',
      batteryHealth: 93,
      billBoxAvailable: true,
      warranty: '60-Day Testing Warranty',
      shopId: 'shop_01',
      shopName: 'Sharma Telecom',
      shopLocality: 'Malviya Nagar',
      shopCity: 'Jaipur',
      shopPhone: '9829012345',
      shopWhatsapp: '919829012345',
      shopDistanceKm: 1.2,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80'
      ],
      isSold: false,
      isFeatured: true,
      viewsCount: 310,
      leadsCount: 38,
      createdAt: '2026-03-15'
    },
    {
      id: 'ph_07',
      brand: 'OnePlus',
      model: '10T 5G',
      ram: '12GB',
      storage: '256GB',
      color: 'Jade Green',
      price: 21500,
      mrp: 49999,
      condition: 'Good',
      batteryHealth: 88,
      billBoxAvailable: true,
      warranty: '15-Day Shop Warranty',
      shopId: 'shop_02',
      shopName: 'Apex Mobile Hub',
      shopLocality: 'Raja Park',
      shopCity: 'Jaipur',
      shopPhone: '9829098765',
      shopWhatsapp: '919829098765',
      shopDistanceKm: 3.2,
      images: [
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80'
      ],
      isSold: false,
      isFeatured: false,
      viewsCount: 78,
      leadsCount: 7,
      createdAt: '2026-03-21'
    },
    {
      id: 'ph_08',
      brand: 'Vivo',
      model: 'V29 Pro 5G',
      ram: '12GB',
      storage: '256GB',
      color: 'Himalayan Blue',
      price: 24999,
      mrp: 42999,
      condition: 'Like New',
      batteryHealth: 94,
      billBoxAvailable: true,
      warranty: '30-Day Testing Warranty',
      shopId: 'shop_03',
      shopName: 'Royal Phone Care',
      shopLocality: 'Mansarovar',
      shopCity: 'Jaipur',
      shopPhone: '9829033321',
      shopWhatsapp: '919829033321',
      shopDistanceKm: 4.5,
      images: [
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
      ],
      isSold: false,
      isFeatured: false,
      viewsCount: 66,
      leadsCount: 6,
      createdAt: '2026-03-22'
    },
    {
      id: 'ph_09',
      brand: 'Samsung',
      model: 'Galaxy S23 5G',
      ram: '8GB',
      storage: '256GB',
      color: 'Phantom Black',
      price: 43999,
      mrp: 79999,
      condition: 'Pristine',
      batteryHealth: 98,
      billBoxAvailable: true,
      warranty: '45-Day Testing Warranty',
      shopId: 'shop_01',
      shopName: 'Sharma Telecom',
      shopLocality: 'Malviya Nagar',
      shopCity: 'Jaipur',
      shopPhone: '9829012345',
      shopWhatsapp: '919829012345',
      shopDistanceKm: 1.2,
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'
      ],
      isSold: false,
      isFeatured: true,
      viewsCount: 220,
      leadsCount: 25,
      createdAt: '2026-03-17'
    },
    {
      id: 'ph_10',
      brand: 'Apple',
      model: 'iPhone 13',
      ram: '4GB',
      storage: '128GB',
      color: 'Product RED',
      price: 35500,
      mrp: 59900,
      condition: 'Pristine',
      batteryHealth: 94,
      billBoxAvailable: true,
      warranty: '45-Day Testing Warranty',
      shopId: 'shop_04',
      shopName: 'City Cellular',
      shopLocality: 'Malviya Nagar',
      shopCity: 'Jaipur',
      shopPhone: '9829044455',
      shopWhatsapp: '919829044455',
      shopDistanceKm: 0.8,
      images: [
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80'
      ],
      isSold: false,
      isFeatured: false,
      viewsCount: 88,
      leadsCount: 9,
      createdAt: '2026-03-21'
    }
  ]);

  // Filter state
  readonly filterState = signal<PhoneFilterState>({
    searchQuery: '',
    city: 'Jaipur',
    brand: null,
    minPrice: 0,
    maxPrice: 100000,
    condition: null,
    storage: null,
    maxDistanceKm: 25,
    onlyBillBox: false,
    onlyWithWarranty: false
  });

  // Current active merchant shop (matches logged in shopkeeper or defaults to Sharma Telecom for demo)
  readonly activeMerchantShop = computed(() => {
    const user = this.currentUser();
    if (user && user.role === 'shopkeeper' && user.shopId) {
      const found = this.shops().find(s => s.id === user.shopId);
      if (found) return found;
    }
    return this.shops().find(s => s.id === 'shop_01') || this.shops()[0];
  });

  // Cart computed phones
  readonly cartPhones = computed(() => {
    const cartIds = this.cart();
    return this.phones().filter(p => cartIds.includes(p.id));
  });

  // Filtered phone listings
  readonly filteredPhones = computed(() => {
    const list = this.phones();
    const filter = this.filterState();
    const q = filter.searchQuery.trim().toLowerCase();

    return list.filter(phone => {
      if (phone.isSold) return false;
      if (phone.shopCity !== filter.city) return false;

      if (q) {
        const text = `${phone.brand} ${phone.model} ${phone.color} ${phone.storage} ${phone.shopName} ${phone.shopLocality}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      if (filter.brand && phone.brand !== filter.brand) return false;
      if (phone.price < filter.minPrice || phone.price > filter.maxPrice) return false;
      if (filter.condition && phone.condition !== filter.condition) return false;
      if (filter.storage && phone.storage !== filter.storage) return false;
      if (phone.shopDistanceKm > filter.maxDistanceKm) return false;
      if (filter.onlyBillBox && !phone.billBoxAvailable) return false;

      return true;
    });
  });

  readonly brands = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Realme', 'Google'];

  // Persistence helpers
  private loadUserSession(): UserSession | null {
    try {
      const data = localStorage.getItem('mobimarket_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private saveUserSession(session: UserSession | null): void {
    try {
      if (session) {
        localStorage.setItem('mobimarket_user', JSON.stringify(session));
      } else {
        localStorage.removeItem('mobimarket_user');
      }
    } catch {}
  }

  private loadCart(): string[] {
    try {
      const data = localStorage.getItem('mobimarket_cart');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveCart(cart: string[]): void {
    try {
      localStorage.setItem('mobimarket_cart', JSON.stringify(cart));
    } catch {}
  }

  // Auth Operations
  loginBuyer(name: string, phone: string): void {
    const session: UserSession = {
      role: 'buyer',
      name: name.trim() || 'Buyer',
      phone: phone.trim()
    };
    this.currentUser.set(session);
    this.saveUserSession(session);
    this.isAuthModalOpen.set(false);

    // If there was a pending inquiry, trigger it now!
    const pending = this.pendingInquiry();
    if (pending) {
      this.executeInquiry(pending.phone, pending.channel);
      this.pendingInquiry.set(null);
    }
  }

  loginShopkeeper(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    const matchedShop = this.shops().find(s => s.phone.includes(cleanPhone) || s.whatsapp.includes(cleanPhone));
    
    const session: UserSession = {
      role: 'shopkeeper',
      name: matchedShop ? matchedShop.ownerName : 'Shopkeeper',
      phone: cleanPhone,
      shopId: matchedShop ? matchedShop.id : 'shop_01'
    };

    this.currentUser.set(session);
    this.saveUserSession(session);
    this.isAuthModalOpen.set(false);
    return true;
  }

  registerShopkeeper(shopData: {
    shopName: string;
    ownerName: string;
    phone: string;
    whatsapp: string;
    address: string;
    locality: string;
    city: string;
    openHours: string;
    image: string;
    googleMapsUrl?: string;
  }): Shop {
    const id = 'shop_' + Date.now();
    const slug = shopData.shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const mapsLink = shopData.googleMapsUrl?.trim() || 
      `https://maps.google.com/?q=${encodeURIComponent(shopData.shopName + ' ' + shopData.address + ' ' + shopData.city)}`;

    const newShop: Shop = {
      id,
      name: shopData.shopName,
      ownerName: shopData.ownerName,
      verified: true,
      rating: 5.0,
      reviewsCount: 1,
      address: shopData.address,
      locality: shopData.locality,
      city: shopData.city,
      phone: shopData.phone,
      whatsapp: shopData.whatsapp.startsWith('91') ? shopData.whatsapp : '91' + shopData.whatsapp,
      image: shopData.image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      openHours: shopData.openHours || '10:00 AM - 9:30 PM',
      distanceKm: 1.5,
      activeListingsCount: 0,
      lat: 26.8530,
      lng: 75.8050,
      slug,
      googleMapsUrl: mapsLink
    };

    this.shops.update(shops => [newShop, ...shops]);

    // Automatically log in as the newly registered shopkeeper
    const session: UserSession = {
      role: 'shopkeeper',
      name: newShop.ownerName,
      phone: newShop.phone,
      shopId: newShop.id
    };
    this.currentUser.set(session);
    this.saveUserSession(session);

    return newShop;
  }

  logout(): void {
    this.currentUser.set(null);
    this.saveUserSession(null);
  }

  // Inquiry Flow with Gate
  requestInquiry(phone: PhoneListing, channel: 'whatsapp' | 'call'): void {
    const user = this.currentUser();
    if (!user) {
      // Must login as buyer before inquiring
      this.pendingInquiry.set({ phone, channel });
      this.isAuthModalOpen.set(true);
      return;
    }

    this.executeInquiry(phone, channel);
  }

  private executeInquiry(phone: PhoneListing, channel: 'whatsapp' | 'call'): void {
    this.recordLead(phone.id);
    const user = this.currentUser();
    const buyerName = user ? user.name : 'a verified buyer';

    if (channel === 'whatsapp') {
      const text = `Namaste ${phone.shopName}! I am ${buyerName}. I saw your ${phone.brand} ${phone.model} (${phone.storage}) for ₹${phone.price.toLocaleString('en-IN')} on MobiMarket. Is this phone currently available at your shop for testing?`;
      window.open(`https://wa.me/${phone.shopWhatsapp}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.location.href = `tel:${phone.shopPhone}`;
    }
  }

  // Cart Operations
  addToCart(phoneId: string): void {
    const current = this.cart();
    if (!current.includes(phoneId)) {
      const updated = [...current, phoneId];
      this.cart.set(updated);
      this.saveCart(updated);
    }
  }

  removeFromCart(phoneId: string): void {
    const updated = this.cart().filter(id => id !== phoneId);
    this.cart.set(updated);
    this.saveCart(updated);
  }

  isInCart(phoneId: string): boolean {
    return this.cart().includes(phoneId);
  }

  toggleCart(phoneId: string): void {
    if (this.isInCart(phoneId)) {
      this.removeFromCart(phoneId);
    } else {
      this.addToCart(phoneId);
    }
  }

  clearCart(): void {
    this.cart.set([]);
    this.saveCart([]);
  }

  // Filter updates
  setSearch(query: string): void {
    this.filterState.update(s => ({ ...s, searchQuery: query }));
  }

  setCity(city: string): void {
    this.currentCity.set(city);
    this.filterState.update(s => ({ ...s, city }));
  }

  setBrand(brand: string | null): void {
    this.filterState.update(s => ({
      ...s,
      brand: s.brand === brand ? null : brand
    }));
  }

  setPriceRange(min: number, max: number): void {
    this.filterState.update(s => ({ ...s, minPrice: min, maxPrice: max }));
  }

  setCondition(condition: PhoneCondition | null): void {
    this.filterState.update(s => ({
      ...s,
      condition: s.condition === condition ? null : condition
    }));
  }

  setStorage(storage: string | null): void {
    this.filterState.update(s => ({
      ...s,
      storage: s.storage === storage ? null : storage
    }));
  }

  setMaxDistance(distanceKm: number): void {
    this.filterState.update(s => ({ ...s, maxDistanceKm: distanceKm }));
  }

  toggleBillBox(): void {
    this.filterState.update(s => ({ ...s, onlyBillBox: !s.onlyBillBox }));
  }

  resetFilters(): void {
    this.filterState.set({
      searchQuery: '',
      city: this.currentCity(),
      brand: null,
      minPrice: 0,
      maxPrice: 100000,
      condition: null,
      storage: null,
      maxDistanceKm: 25,
      onlyBillBox: false,
      onlyWithWarranty: false
    });
  }

  getPhoneById(id: string): PhoneListing | undefined {
    return this.phones().find(p => p.id === id);
  }

  getShopById(id: string): Shop | undefined {
    return this.shops().find(s => s.id === id);
  }

  getPhonesByShop(shopId: string, includeSold: boolean = false): PhoneListing[] {
    return this.phones().filter(p => p.shopId === shopId && (includeSold || !p.isSold));
  }

  getCompareListings(model: string = 'iPhone 13'): PhoneListing[] {
    const term = model.toLowerCase();
    return this.phones()
      .filter(p => !p.isSold && p.model.toLowerCase().includes(term))
      .sort((a, b) => a.price - b.price);
  }

  markAsSold(phoneId: string): void {
    this.phones.update(list =>
      list.map(p => (p.id === phoneId ? { ...p, isSold: !p.isSold } : p))
    );
  }

  updatePrice(phoneId: string, newPrice: number): void {
    this.phones.update(list =>
      list.map(p => (p.id === phoneId ? { ...p, price: newPrice } : p))
    );
  }

  updatePhoneImages(phoneId: string, images: string[]): void {
    this.phones.update(list =>
      list.map(p => (p.id === phoneId ? { ...p, images: [...images] } : p))
    );
  }

  deletePhone(phoneId: string): void {
    this.phones.update(list => list.filter(p => p.id !== phoneId));
    this.removeFromCart(phoneId);
  }

  addPhone(newPhone: Omit<PhoneListing, 'id' | 'viewsCount' | 'leadsCount' | 'createdAt'>): void {
    const created: PhoneListing = {
      ...newPhone,
      id: 'ph_' + Date.now(),
      viewsCount: 1,
      leadsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.phones.update(list => [created, ...list]);
  }

  recordLead(phoneId: string): void {
    this.phones.update(list =>
      list.map(p => (p.id === phoneId ? { ...p, leadsCount: p.leadsCount + 1 } : p))
    );
  }

  getWhatsAppUrl(phone: PhoneListing): string {
    const user = this.currentUser();
    const buyerName = user ? user.name : 'a verified buyer';
    const text = `Namaste ${phone.shopName}! I am ${buyerName}. I saw your ${phone.brand} ${phone.model} (${phone.storage}) for ₹${phone.price.toLocaleString('en-IN')} on MobiMarket. Is this phone currently available at your shop?`;
    return `https://wa.me/${phone.shopWhatsapp}?text=${encodeURIComponent(text)}`;
  }
}
