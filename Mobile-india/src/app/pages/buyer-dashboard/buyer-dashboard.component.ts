import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { PhoneListing } from '../../models/phone.model';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.css'
})
export class BuyerDashboardComponent {
  marketplace = inject(MarketplaceService);

  get user() {
    return this.marketplace.currentUser();
  }

  get cartItems(): PhoneListing[] {
    return this.marketplace.cartPhones();
  }

  get totalCartPrice(): number {
    return this.cartItems.reduce((acc, p) => acc + p.price, 0);
  }

  get totalCartMrp(): number {
    return this.cartItems.reduce((acc, p) => acc + (p.mrp || p.price), 0);
  }

  get totalSavings(): number {
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
      const query = encodeURIComponent(`${phone.shopName}, ${phone.shopLocality}, ${phone.shopCity}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  }

  logout(): void {
    this.marketplace.logout();
  }
}
