import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { PhoneListing, CustomerLead } from '../../models/user.model';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  authService = inject(AuthService);

  shopId = signal<string>('');
  stats = signal<any>({
    activeInventoryCount: 0,
    soldCount: 0,
    leadsToday: 0,
    leadsTotal: 0,
    viewsToday: 0,
    viewsTotal: 0,
    totalInventoryValue: 0
  });

  myPhones = signal<PhoneListing[]>([]);
  leads = signal<CustomerLead[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    const user = this.authService.currentUser();
    const sid = user?.shopId || 'shop_01';
    this.shopId.set(sid);
    this.loadDashboardData(sid);
  }

  loadDashboardData(shopId: string) {
    this.isLoading.set(true);

    // 1. Fetch Metrics: GET /analytics/dashboard/:shopId
    this.http.get<any>(`${environment.apiUrl}/analytics/dashboard/${shopId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) this.stats.set(res.data);
      },
      error: () => {}
    });

    // 2. Fetch Shop Phones (Active + Sold): GET /phones?shopId=:id&includeSold=true
    this.http.get<any>(`${environment.apiUrl}/phones?shopId=${shopId}&includeSold=true`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.myPhones.set(res.data);
        }
      },
      error: () => {
        // Fallback for general endpoint
        this.http.get<any>(`${environment.apiUrl}/phones?city=`).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              const shopPhones = res.data.filter((p: any) => p.shopId === shopId);
              this.myPhones.set(shopPhones);
            }
          }
        });
      }
    });

    // 3. Fetch Customer Leads: GET /leads/shop/:shopId
    this.http.get<any>(`${environment.apiUrl}/leads/shop/${shopId}`).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) this.leads.set(res.data);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('mobimarket_token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  // 🏷️ Toggle Sold Status: PATCH /phones/:id/sold
  toggleSoldStatus(phoneId: string, currentStatus: boolean) {
    const nextSold = !currentStatus;
    this.http.patch<any>(`${environment.apiUrl}/phones/${phoneId}/sold`, { isSold: nextSold }, this.getAuthHeaders()).subscribe({
      next: (res) => {
        if (res.success) {
          this.myPhones.update(list => list.map(p => p.id === phoneId ? { ...p, isSold: nextSold } : p));
        }
      },
      error: (err) => {
        // Optimistic UI fallback
        this.myPhones.update(list => list.map(p => p.id === phoneId ? { ...p, isSold: nextSold } : p));
      }
    });
  }

  markAsSold(phoneId: string) {
    this.toggleSoldStatus(phoneId, false);
  }

  relistPhone(phoneId: string) {
    this.toggleSoldStatus(phoneId, true);
  }

  // ✏️ Update Price: PATCH /phones/:id/price
  updatePrice(phone: PhoneListing) {
    const input = prompt(`Enter new price for ${phone.brand} ${phone.model} (current: ₹${phone.price}):`, String(phone.price));
    if (!input) return;
    const newPrice = Number(input.replace(/[^0-9]/g, ''));
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Please enter a valid price amount');
      return;
    }

    this.http.patch<any>(`${environment.apiUrl}/phones/${phone.id}/price`, { price: newPrice }, this.getAuthHeaders()).subscribe({
      next: (res) => {
        if (res.success) {
          this.myPhones.update(list => list.map(p => p.id === phone.id ? { ...p, price: newPrice } : p));
        }
      },
      error: () => {
        this.myPhones.update(list => list.map(p => p.id === phone.id ? { ...p, price: newPrice } : p));
      }
    });
  }

  // 🗑️ Delete Listing Permanently: DELETE /phones/:id
  deletePhone(phoneId: string) {
    if (!confirm('Are you sure you want to permanently delete this phone listing?')) return;

    this.http.delete<any>(`${environment.apiUrl}/phones/${phoneId}`, this.getAuthHeaders()).subscribe({
      next: (res) => {
        if (res.success) {
          this.myPhones.update(list => list.filter(p => p.id !== phoneId));
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete listing');
        this.myPhones.update(list => list.filter(p => p.id !== phoneId));
      }
    });
  }
}
