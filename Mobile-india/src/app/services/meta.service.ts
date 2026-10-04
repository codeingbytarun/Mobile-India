import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface CityData {
  name: string;
  localities: string[];
  lat?: number;
  lng?: number;
}

export interface BrandCatalog {
  brand: string;
  models: string[];
}

export interface PriceEstimate {
  model: string;
  estimatedPrice: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/meta`;

  readonly cities = signal<CityData[]>([]);
  readonly brands = signal<BrandCatalog[]>([]);

  // 8.1 Cities & Localities
  getCities(): Observable<ApiResponse<CityData[]>> {
    return this.http.get<ApiResponse<CityData[]>>(`${this.baseUrl}/cities`).pipe(
      tap(res => {
        if (res.success && Array.isArray(res.data)) {
          this.cities.set(res.data);
        }
      })
    );
  }

  // 8.2 Brands & Models Catalog
  getBrands(): Observable<ApiResponse<BrandCatalog[]>> {
    return this.http.get<ApiResponse<BrandCatalog[]>>(`${this.baseUrl}/brands`).pipe(
      tap(res => {
        if (res.success && Array.isArray(res.data)) {
          this.brands.set(res.data);
        }
      })
    );
  }

  // 8.3 Fair-Market Valuation Estimator
  estimatePrice(params: {
    model: string;
    storage?: string;
    condition?: string;
    batteryHealth?: number;
  }): Observable<ApiResponse<PriceEstimate>> {
    let httpParams = new HttpParams().set('model', params.model);
    if (params.storage) httpParams = httpParams.set('storage', params.storage);
    if (params.condition) httpParams = httpParams.set('condition', params.condition);
    if (params.batteryHealth) httpParams = httpParams.set('batteryHealth', String(params.batteryHealth));

    return this.http.get<ApiResponse<PriceEstimate>>(`${this.baseUrl}/price-estimator`, { params: httpParams });
  }
}
