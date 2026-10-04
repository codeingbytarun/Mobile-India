import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Shop, ShopReview, ShopQrResponse } from '../models/shop.model';
import { PhoneListing } from '../models/phone.model';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/shops`;

  readonly currentShop = signal<Shop | null>(null);
  readonly shops = signal<Shop[]>([]);
  readonly isLoading = signal<boolean>(false);

  // 2.1 Get Shops with geo sorting & city filter
  getShops(params: {
    city?: string;
    locality?: string;
    verifiedOnly?: boolean;
    userLat?: number;
    userLng?: number;
    q?: string;
    page?: number;
    limit?: number;
  } = {}): Observable<ApiResponse<Shop[]>> {
    this.isLoading.set(true);
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        httpParams = httpParams.set(key, String(val));
      }
    });

    return this.http.get<ApiResponse<Shop[]>>(this.baseUrl, { params: httpParams }).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && Array.isArray(res.data)) {
          this.shops.set(res.data);
        }
      })
    );
  }

  // 2.2 Get Shop Profile & Live Inventory
  getShopByIdOrSlug(idOrSlug: string): Observable<ApiResponse<{ shop: Shop; inventory: PhoneListing[] }>> {
    this.isLoading.set(true);
    return this.http.get<ApiResponse<{ shop: Shop; inventory: PhoneListing[] }>>(`${this.baseUrl}/${idOrSlug}`).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && res.data?.shop) {
          this.currentShop.set(res.data.shop);
        }
      })
    );
  }

  // 2.3 Update Shop Profile
  updateShop(shopId: string, updates: Partial<Shop>): Observable<ApiResponse<Shop>> {
    return this.http.put<ApiResponse<Shop>>(`${this.baseUrl}/${shopId}`, updates).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentShop.set(res.data);
          this.shops.update(list => list.map(s => s.id === shopId ? res.data : s));
        }
      })
    );
  }

  // 2.4 Get QR Code Data URL
  getShopQrCode(shopId: string): Observable<ApiResponse<ShopQrResponse>> {
    return this.http.get<ApiResponse<ShopQrResponse>>(`${this.baseUrl}/${shopId}/qr`);
  }

  // 2.5 Get Shop Reviews
  getShopReviews(shopId: string): Observable<ApiResponse<ShopReview[]>> {
    return this.http.get<ApiResponse<ShopReview[]>>(`${this.baseUrl}/${shopId}/reviews`);
  }

  // 2.6 Submit Shop Review
  addShopReview(shopId: string, rating: number, comment: string): Observable<ApiResponse<ShopReview>> {
    return this.http.post<ApiResponse<ShopReview>>(`${this.baseUrl}/${shopId}/reviews`, { rating, comment });
  }

  // 2.7 Check Slug Availability
  checkSlug(slug: string): Observable<ApiResponse<{ isAvailable: boolean }>> {
    return this.http.get<ApiResponse<{ isAvailable: boolean }>>(`${this.baseUrl}/check-slug/${slug}`);
  }
}
