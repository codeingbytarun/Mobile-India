import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PhoneListing } from '../models/phone.model';

export interface CartItem extends Partial<PhoneListing> {
  id: string;
  phoneId?: string;
  addedAt?: string;
  phone?: PhoneListing;
}

export interface CartData {
  itemsCount: number;
  totalPrice: number;
  totalMrp: number;
  totalSavings: number;
  items: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/buyer/cart`;

  readonly cart = signal<CartData | null>(null);
  readonly cartCount = signal<number>(this.loadLocalCartIds().length);
  readonly localCartIds = signal<string[]>(this.loadLocalCartIds());

  constructor() {
    if (localStorage.getItem('mobimarket_token')) {
      this.loadCart().subscribe();
    }
  }

  // 4.1 Get Cart
  loadCart(): Observable<ApiResponse<CartData>> {
    return this.http.get<ApiResponse<CartData>>(this.baseUrl).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cart.set(res.data);
          this.cartCount.set(res.data.itemsCount);
          const ids = res.data.items?.map((i: any) => i.phoneId || i.phone?.id || i.id || i._id).filter(Boolean) || [];
          this.saveLocalCartIds(ids);
        }
      }),
      catchError(err => {
        return of({
          success: false,
          statusCode: 500,
          message: err?.message || 'Failed to load cart',
          data: {
            itemsCount: this.localCartIds().length,
            totalPrice: 0,
            totalMrp: 0,
            totalSavings: 0,
            items: []
          }
        });
      })
    );
  }

  // 4.2 Add to Cart
  addToCart(phoneId: string): Observable<ApiResponse<{ cartCount: number }>> {
    // Optimistically update local
    const current = this.localCartIds();
    if (!current.includes(phoneId)) {
      const updated = [...current, phoneId];
      this.saveLocalCartIds(updated);
    }

    if (!localStorage.getItem('mobimarket_token')) {
      return of({
        success: true,
        statusCode: 200,
        message: 'Saved to local cart',
        data: { cartCount: this.localCartIds().length }
      });
    }

    return this.http.post<ApiResponse<{ cartCount: number }>>(this.baseUrl, { phoneId }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartCount.set(res.data.cartCount);
          this.loadCart().subscribe();
        }
      }),
      catchError(() => {
        return of({
          success: true,
          statusCode: 200,
          message: 'Saved locally',
          data: { cartCount: this.localCartIds().length }
        });
      })
    );
  }

  // 4.3 Remove Item from Cart
  removeFromCart(phoneId: string): Observable<ApiResponse<null>> {
    const updated = this.localCartIds().filter(id => id !== phoneId);
    this.saveLocalCartIds(updated);

    if (!localStorage.getItem('mobimarket_token')) {
      return of({
        success: true,
        statusCode: 200,
        message: 'Removed from local cart',
        data: null
      });
    }

    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${phoneId}`).pipe(
      tap(() => this.loadCart().subscribe()),
      catchError(() => of({ success: true, statusCode: 200, message: 'Removed', data: null }))
    );
  }

  // 4.4 Clear Cart
  clearCart(): Observable<ApiResponse<null>> {
    this.saveLocalCartIds([]);
    this.cart.set(null);

    if (!localStorage.getItem('mobimarket_token')) {
      return of({ success: true, statusCode: 200, message: 'Cart cleared', data: null });
    }

    return this.http.delete<ApiResponse<null>>(this.baseUrl).pipe(
      tap(() => {
        this.cart.set(null);
        this.cartCount.set(0);
      }),
      catchError(() => of({ success: true, statusCode: 200, message: 'Cart cleared', data: null }))
    );
  }

  // 4.5 Sync Local Storage Cart
  syncCart(phoneIds: string[] = this.localCartIds()): Observable<ApiResponse<{ itemsCount: number }>> {
    if (!localStorage.getItem('mobimarket_token')) {
      return of({
        success: true,
        statusCode: 200,
        message: 'No user token found',
        data: { itemsCount: phoneIds.length }
      });
    }

    if (phoneIds.length === 0) {
      this.loadCart().subscribe();
      return of({
        success: true,
        statusCode: 200,
        message: 'Cart loaded from server',
        data: { itemsCount: 0 }
      });
    }

    return this.http.post<ApiResponse<{ itemsCount: number }>>(`${this.baseUrl}/sync`, { phoneIds }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartCount.set(res.data.itemsCount);
          this.loadCart().subscribe();
        }
      }),
      catchError(() => {
        this.loadCart().subscribe();
        return of({
          success: true,
          statusCode: 200,
          message: 'Synced locally',
          data: { itemsCount: this.localCartIds().length }
        });
      })
    );
  }

  resetOnLogout(): void {
    this.cart.set(null);
    const local = this.loadLocalCartIds();
    this.localCartIds.set(local);
    this.cartCount.set(local.length);
  }

  isInCart(phoneId: string): boolean {
    return this.localCartIds().includes(phoneId);
  }

  toggleCart(phoneId: string): void {
    if (this.isInCart(phoneId)) {
      this.removeFromCart(phoneId).subscribe();
    } else {
      this.addToCart(phoneId).subscribe();
    }
  }

  private loadLocalCartIds(): string[] {
    try {
      const data = localStorage.getItem('mobimarket_cart');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalCartIds(ids: string[]): void {
    try {
      localStorage.setItem('mobimarket_cart', JSON.stringify(ids));
      this.localCartIds.set(ids);
      this.cartCount.set(ids.length);
    } catch {}
  }
}
