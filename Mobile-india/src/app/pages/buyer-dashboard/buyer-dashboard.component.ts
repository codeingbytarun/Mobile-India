import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { CartService } from '../../services/cart.service';
import { LeadService, LeadItem } from '../../services/lead.service';
import { PhoneListing } from '../../models/phone.model';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.css'
})
export class BuyerDashboardComponent implements OnInit {
  marketplace = inject(MarketplaceService);
  cartService = inject(CartService);
  leadService = inject(LeadService);
  private router = inject(Router);

  myInquiries = signal<LeadItem[]>([]);

  ngOnInit(): void {
    if (this.marketplace.currentUser()?.role === 'shopkeeper') {
      this.router.navigate(['/seller/dashboard']);
      return;
    }
    this.cartService.loadCart().subscribe();
    if (this.marketplace.currentUser()) {
      this.leadService.getMyInquiries().subscribe(res => {
        if (res.success && res.data) {
          this.myInquiries.set(res.data);
        }
      });
    }
  }

  get user() {
    return this.marketplace.currentUser();
  }

  get cartItems(): PhoneListing[] {
    return this.marketplace.cartPhones();
  }

  get totalCartPrice(): number {
    const sCart = this.cartService.cart();
    if (sCart?.totalPrice !== undefined && sCart.totalPrice > 0) {
      return sCart.totalPrice;
    }
    return this.cartItems.reduce((acc, p) => acc + (p.price || 0), 0);
  }

  get totalCartMrp(): number {
    const sCart = this.cartService.cart();
    if (sCart?.totalMrp !== undefined && sCart.totalMrp > 0) {
      return sCart.totalMrp;
    }
    return this.cartItems.reduce((acc, p) => acc + (p.mrp || p.price || 0), 0);
  }

  get totalSavings(): number {
    const sCart = this.cartService.cart();
    if (sCart?.totalSavings !== undefined && sCart.totalSavings > 0) {
      return sCart.totalSavings;
    }
    return Math.max(0, this.totalCartMrp - this.totalCartPrice);
  }

  removeItem(phoneId: string): void {
    this.marketplace.removeFromCart(phoneId);
  }

  inquireWhatsApp(phone: PhoneListing): void {
    this.marketplace.requestInquiry(phone, 'whatsapp');
  }

  callShop(phone: PhoneListing): void {
    this.marketplace.requestInquiry(phone, 'call');
  }

  getDirections(phone: PhoneListing): void {
    const shop = this.marketplace.getShopById(phone.shopId);
    if (shop?.googleMapsUrl) {
      window.open(shop.googleMapsUrl, '_blank');
    } else {
      const query = encodeURIComponent(`${phone.shopName || ''}, ${phone.shopLocality || ''}, ${phone.shopCity || ''}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  }

  logout(): void {
    this.marketplace.logout();
  }
}
