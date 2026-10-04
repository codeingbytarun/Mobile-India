import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PhoneListing, PhoneFilterState, PhoneCondition } from '../models/phone.model';
import { Shop } from '../models/shop.model';
import { AuthService } from './auth.service';
import { ShopService } from './shop.service';
import { CartService } from './cart.service';
import { LeadService } from './lead.service';
import { UserSession, ShopRegistrationData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private shopService = inject(ShopService);
  private cartService = inject(CartService);
  private leadService = inject(LeadService);

  private readonly baseUrl = `${environment.apiUrl}/phones`;

  // Cities supported
  readonly availableCities = ['Jaipur', 'Delhi NCR', 'Mumbai', 'Bengaluru'];
  readonly brands = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Realme', 'Google'];

  // Current selected city
  readonly currentCity = signal<string>('Jaipur');

  // Phone Listings State
  readonly phones = signal<PhoneListing[]>([]);
  readonly featuredPhones = signal<PhoneListing[]>([]);
  readonly shops = signal<Shop[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // User Auth State - mirrored from AuthService
  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;

  // Cart State - mirrored from CartService
  readonly cart = this.cartService.localCartIds;

  // Auth Modal State for inquiries / actions
  readonly isAuthModalOpen = signal<boolean>(false);
  readonly pendingInquiry = signal<{ phone: PhoneListing; channel: 'whatsapp' | 'call' } | null>(null);

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

  // Current active merchant shop (matches logged in shopkeeper or first shop in list)
  readonly activeMerchantShop = computed(() => {
    const user = this.currentUser();
    const allShops = this.shops();
    if (user && user.role === 'shopkeeper' && user.shopId) {
      const found = allShops.find(s => s.id === user.shopId);
      if (found) return found;
    }
    return allShops[0] || this.createPlaceholderShop();
  });

  // Cart computed phones
  readonly cartPhones = computed(() => {
    const serverCart = this.cartService.cart();
    if (serverCart && serverCart.items && serverCart.items.length > 0) {
      return serverCart.items.map((i: any) => (i.phone ? { ...i.phone, id: i.phoneId || i.phone.id } : i));
    }
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
      if (phone.shopCity && phone.shopCity !== filter.city) return false;

      if (q) {
        const text = `${phone.brand} ${phone.model} ${phone.color || ''} ${phone.storage} ${phone.shopName || ''} ${phone.shopLocality || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      if (filter.brand && phone.brand !== filter.brand) return false;
      if (phone.price < filter.minPrice || phone.price > filter.maxPrice) return false;
      if (filter.condition && phone.condition !== filter.condition) return false;
      if (filter.storage && phone.storage !== filter.storage) return false;
      if (phone.shopDistanceKm && phone.shopDistanceKm > filter.maxDistanceKm) return false;
      if (filter.onlyBillBox && !phone.billBoxAvailable) return false;

      return true;
    });
  });

  constructor() {
    this.initialLoad();
  }

  initialLoad(): void {
    this.loadPhones().subscribe();
    this.loadFeatured().subscribe();
    this.loadShops().subscribe();
  }

  // ----------------------------------------------------
  // Module 3: Phone Listings & Inventory APIs (10 APIs)
  // ----------------------------------------------------

  // 3.1 Get Phones with Filtering
  loadPhones(filter: Partial<PhoneFilterState> = {}): Observable<ApiResponse<PhoneListing[]>> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const mergedFilter = { ...this.filterState(), ...filter };
    let params = new HttpParams().set('city', mergedFilter.city || this.currentCity());

    if (mergedFilter.searchQuery) params = params.set('q', mergedFilter.searchQuery);
    if (mergedFilter.brand) params = params.set('brand', mergedFilter.brand);
    if (mergedFilter.condition) params = params.set('condition', mergedFilter.condition);
    if (mergedFilter.storage) params = params.set('storage', mergedFilter.storage);
    if (mergedFilter.minPrice) params = params.set('minPrice', String(mergedFilter.minPrice));
    if (mergedFilter.maxPrice && mergedFilter.maxPrice < 100000) params = params.set('maxPrice', String(mergedFilter.maxPrice));
    if (mergedFilter.onlyBillBox) params = params.set('onlyBillBox', 'true');
    if (mergedFilter.onlyWithWarranty) params = params.set('onlyWithWarranty', 'true');
    if (mergedFilter.maxDistanceKm && mergedFilter.maxDistanceKm < 25) params = params.set('maxDistanceKm', String(mergedFilter.maxDistanceKm));

    return this.http.get<ApiResponse<PhoneListing[]>>(this.baseUrl, { params }).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && Array.isArray(res.data)) {
          this.phones.set(res.data);
        }
      }),
      catchError(err => {
        this.isLoading.set(false);
        console.warn('API /phones offline or error:', err?.message || err);
        return of({
          success: false,
          statusCode: 500,
          message: err?.message || 'Failed to load phones',
          data: this.phones()
        });
      })
    );
  }

  // 3.2 Get Featured Phones
  loadFeatured(city: string = this.currentCity()): Observable<ApiResponse<PhoneListing[]>> {
    return this.http.get<ApiResponse<PhoneListing[]>>(`${this.baseUrl}/featured`, {
      params: { city }
    }).pipe(
      tap(res => {
        if (res.success && Array.isArray(res.data)) {
          this.featuredPhones.set(res.data);
        }
      }),
      catchError(err => {
        console.warn('API /phones/featured offline or error:', err?.message || err);
        return of({
          success: false,
          statusCode: 500,
          message: err?.message || 'Failed to load featured phones',
          data: []
        });
      })
    );
  }

  // 3.3 Get Phone Details & Increment View
  getPhoneById(id: string): Observable<ApiResponse<PhoneListing>> {
    return this.http.get<ApiResponse<PhoneListing>>(`${this.baseUrl}/${id}`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.phones.update(list => {
            const index = list.findIndex(p => p.id === id);
            if (index >= 0) {
              const updated = [...list];
              updated[index] = res.data;
              return updated;
            }
            return [res.data, ...list];
          });
        }
      }),
      catchError(err => {
        const cached = this.phones().find(p => p.id === id);
        if (cached) {
          return of({ success: true, statusCode: 200, message: 'Cached', data: cached });
        }
        return of({ success: false, statusCode: 404, message: 'Not found', data: null as any });
      })
    );
  }

  // Synchronous cache lookup helper for backward compatibility
  findCachedPhone(id: string): PhoneListing | undefined {
    return this.phones().find(p => p.id === id);
  }

  // 3.4 Compare Phone Model across City Shops
  comparePhones(model: string, city: string = this.currentCity()): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/compare`, {
      params: { model, city }
    }).pipe(
      catchError(err => {
        const term = model.toLowerCase();
        const local = this.phones()
          .filter(p => !p.isSold && p.model.toLowerCase().includes(term))
          .sort((a, b) => a.price - b.price);
        return of({ success: true, statusCode: 200, message: 'Fallback compare', data: local });
      })
    );
  }

  // 3.5 Create Phone Listing (Seller)
  createPhone(phoneData: Partial<PhoneListing>): Observable<ApiResponse<{ id: string }>> {
    return this.http.post<ApiResponse<{ id: string }>>(this.baseUrl, phoneData).pipe(
      tap(() => this.loadPhones().subscribe()),
      catchError(err => {
        // Fallback optimistic update
        const id = 'ph_' + Date.now();
        const created: PhoneListing = {
          id,
          brand: phoneData.brand || 'Other',
          model: phoneData.model || '',
          ram: phoneData.ram || '6GB',
          storage: phoneData.storage || '128GB',
          color: phoneData.color || 'Black',
          price: phoneData.price || 0,
          mrp: phoneData.mrp || (phoneData.price ? phoneData.price * 1.4 : 0),
          condition: phoneData.condition || 'Like New',
          batteryHealth: phoneData.batteryHealth,
          billBoxAvailable: !!phoneData.billBoxAvailable,
          warranty: phoneData.warranty || '30-Day Testing Warranty',
          shopId: phoneData.shopId || this.activeMerchantShop().id,
          shopName: phoneData.shopName || this.activeMerchantShop().name,
          shopLocality: phoneData.shopLocality || this.activeMerchantShop().locality,
          shopCity: phoneData.shopCity || this.activeMerchantShop().city,
          shopPhone: phoneData.shopPhone || this.activeMerchantShop().phone,
          shopWhatsapp: phoneData.shopWhatsapp || this.activeMerchantShop().whatsapp,
          shopDistanceKm: phoneData.shopDistanceKm || this.activeMerchantShop().distanceKm || 1.2,
          images: phoneData.images?.length ? phoneData.images : ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80'],
          isSold: false,
          viewsCount: 1,
          leadsCount: 0,
          createdAt: new Date().toISOString()
        };
        this.phones.update(list => [created, ...list]);
        return of({ success: true, statusCode: 201, message: 'Created listing locally', data: { id } });
      })
    );
  }

  // 3.6 Update Full Listing
  updatePhone(id: string, updates: Partial<PhoneListing>): Observable<ApiResponse<PhoneListing>> {
    return this.http.put<ApiResponse<PhoneListing>>(`${this.baseUrl}/${id}`, updates).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.phones.update(list => list.map(p => p.id === id ? res.data : p));
        }
      })
    );
  }

  // 3.7 1-Tap Quick Price Adjustment
  updatePrice(id: string, price: number): Observable<ApiResponse<null>> {
    this.phones.update(list => list.map(p => p.id === id ? { ...p, price } : p));

    return this.http.patch<ApiResponse<null>>(`${this.baseUrl}/${id}/price`, { price }).pipe(
      catchError(() => of({ success: true, statusCode: 200, message: 'Price updated', data: null }))
    );
  }

  // 3.8 1-Tap Status Toggle (Active <-> Sold)
  toggleSold(id: string, isSold: boolean): Observable<ApiResponse<{ isSold: boolean }>> {
    this.phones.update(list => list.map(p => p.id === id ? { ...p, isSold } : p));

    return this.http.patch<ApiResponse<{ isSold: boolean }>>(`${this.baseUrl}/${id}/sold`, { isSold }).pipe(
      catchError(() => of({ success: true, statusCode: 200, message: 'Status updated', data: { isSold } }))
    );
  }

  // 3.9 Update Images Gallery
  updateImages(id: string, images: string[]): Observable<ApiResponse<{ images: string[] }>> {
    this.phones.update(list => list.map(p => p.id === id ? { ...p, images } : p));

    return this.http.patch<ApiResponse<{ images: string[] }>>(`${this.baseUrl}/${id}/images`, { images }).pipe(
      catchError(() => of({ success: true, statusCode: 200, message: 'Images updated', data: { images } }))
    );
  }

  // 3.10 Delete Listing
  deletePhone(id: string): Observable<ApiResponse<null>> {
    this.phones.update(list => list.filter(p => p.id !== id));
    this.cartService.removeFromCart(id);

    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => of({ success: true, statusCode: 200, message: 'Listing deleted', data: null }))
    );
  }

  // ----------------------------------------------------
  // Shop Helpers
  // ----------------------------------------------------
  loadShops(city: string = this.currentCity()): Observable<ApiResponse<Shop[]>> {
    return this.shopService.getShops({ city }).pipe(
      tap(res => {
        if (res.success && Array.isArray(res.data)) {
          this.shops.set(res.data);
        }
      })
    );
  }

  getShopById(id: string): Shop | undefined {
    return this.shops().find(s => s.id === id);
  }

  getPhonesByShop(shopId: string, includeSold: boolean = false): PhoneListing[] {
    return this.phones().filter(p => p.shopId === shopId && (includeSold || !p.isSold));
  }

  // ----------------------------------------------------
  // Filter Operations
  // ----------------------------------------------------
  setSearch(query: string): void {
    this.filterState.update(s => ({ ...s, searchQuery: query }));
  }

  setCity(city: string): void {
    this.currentCity.set(city);
    this.filterState.update(s => ({ ...s, city }));
    this.loadPhones({ city }).subscribe();
    this.loadFeatured(city).subscribe();
    this.loadShops(city).subscribe();
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
    this.loadPhones().subscribe();
  }

  // ----------------------------------------------------
  // Cart Actions (Delegated to CartService)
  // ----------------------------------------------------
  addToCart(phoneId: string): void {
    this.cartService.addToCart(phoneId).subscribe();
  }

  removeFromCart(phoneId: string): void {
    this.cartService.removeFromCart(phoneId).subscribe();
  }

  isInCart(phoneId: string): boolean {
    return this.cartService.isInCart(phoneId);
  }

  toggleCart(phoneId: string): void {
    this.cartService.toggleCart(phoneId);
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  // ----------------------------------------------------
  // Inquiry Flow (Delegated to LeadService with Auth Guard)
  // ----------------------------------------------------
  requestInquiry(phone: PhoneListing, channel: 'whatsapp' | 'call'): void {
    const user = this.currentUser();
    if (!user) {
      this.pendingInquiry.set({ phone, channel });
      this.isAuthModalOpen.set(true);
      return;
    }

    this.executeInquiry(phone, channel);
  }

  executeInquiry(phone: PhoneListing, channel: 'whatsapp' | 'call'): void {
    this.recordLead(phone.id);
    this.leadService.initiateInquiry(phone.id, channel).subscribe({
      error: () => {
        // Fallback direct link if lead API endpoint is unreachable
        if (channel === 'whatsapp') {
          const buyerName = this.currentUser()?.name || 'a verified buyer';
          const text = `Namaste ${phone.shopName}! I am ${buyerName}. I saw your ${phone.brand} ${phone.model} (${phone.storage}) for ₹${phone.price.toLocaleString('en-IN')} on MobiMarket. Is this phone currently available at your shop?`;
          window.open(`https://wa.me/${phone.shopWhatsapp}?text=${encodeURIComponent(text)}`, '_blank');
        } else {
          window.location.href = `tel:${phone.shopPhone}`;
        }
      }
    });
  }

  recordLead(phoneId: string): void {
    this.phones.update(list =>
      list.map(p => (p.id === phoneId ? { ...p, leadsCount: (p.leadsCount || 0) + 1 } : p))
    );
  }

  getWhatsAppUrl(phone: PhoneListing): string {
    const user = this.currentUser();
    const buyerName = user ? user.name : 'a verified buyer';
    const text = `Namaste ${phone.shopName}! I am ${buyerName}. I saw your ${phone.brand} ${phone.model} (${phone.storage}) for ₹${phone.price.toLocaleString('en-IN')} on MobiMarket. Is this phone currently available at your shop?`;
    return `https://wa.me/${phone.shopWhatsapp}?text=${encodeURIComponent(text)}`;
  }

  // ----------------------------------------------------
  // Legacy Component Bridging Methods
  // ----------------------------------------------------
  markAsSold(phoneId: string): void {
    const current = this.phones().find(p => p.id === phoneId);
    if (current) {
      this.toggleSold(phoneId, !current.isSold).subscribe();
    }
  }

  updatePhoneImages(phoneId: string, images: string[]): void {
    this.updateImages(phoneId, images).subscribe();
  }

  addPhone(newPhone: Partial<PhoneListing>): void {
    this.createPhone(newPhone).subscribe();
  }

  getCompareListings(model: string = 'iPhone 13'): PhoneListing[] {
    const term = model.toLowerCase();
    return this.phones()
      .filter(p => !p.isSold && p.model.toLowerCase().includes(term))
      .sort((a, b) => a.price - b.price);
  }

  // Auth Operations
  loginBuyer(name: string, phone: string): void {
    const session: UserSession = {
      id: 'usr_' + Date.now(),
      role: 'buyer',
      name: name.trim() || 'Buyer',
      phone: phone.trim()
    };
    localStorage.setItem('mobimarket_user', JSON.stringify(session));
    this.authService.currentUser.set(session);
    this.authService.isAuthenticated.set(true);
    this.isAuthModalOpen.set(false);

    const pending = this.pendingInquiry();
    if (pending) {
      this.executeInquiry(pending.phone, pending.channel);
      this.pendingInquiry.set(null);
    }
  }

  loginShopkeeper(phone: string, email?: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    const matchedShop = this.shops().find(s => s.phone?.includes(cleanPhone) || s.whatsapp?.includes(cleanPhone));

    const session: UserSession = {
      id: matchedShop?.userId || 'usr_shop_' + Date.now(),
      role: 'shopkeeper',
      name: matchedShop ? matchedShop.ownerName : 'Shopkeeper',
      phone: cleanPhone,
      email: email || matchedShop?.email || null,
      shopId: matchedShop ? matchedShop.id : 'shop_01',
      isEmailVerified: true
    };

    localStorage.setItem('mobimarket_user', JSON.stringify(session));
    this.authService.currentUser.set(session);
    this.authService.isAuthenticated.set(true);
    this.isAuthModalOpen.set(false);
    return true;
  }

  registerShopkeeper(shopData: ShopRegistrationData): void {
    this.authService.registerShopkeeper(shopData).subscribe({
      error: () => {
        // Fallback local registration
        const id = 'shop_' + Date.now();
        const newShop: Shop = {
          id,
          name: shopData.shopName,
          ownerName: shopData.ownerName,
          email: shopData.email,
          verified: false,
          rating: 5.0,
          reviewsCount: 0,
          address: shopData.address,
          locality: shopData.locality,
          city: shopData.city,
          phone: shopData.phone,
          whatsapp: shopData.whatsapp || shopData.phone,
          image: shopData.image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
          openHours: shopData.openHours || '10:00 AM - 9:30 PM',
          distanceKm: 1.5,
          activeListingsCount: 0,
          slug: shopData.shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          googleMapsUrl: shopData.googleMapsUrl
        };
        this.shops.update(shops => [newShop, ...shops]);
        this.loginShopkeeper(newShop.phone, newShop.email);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.cartService.resetOnLogout();
  }

  private createPlaceholderShop(): Shop {
    return {
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
      activeListingsCount: 0,
      slug: 'sharma-telecom'
    };
  }
}
