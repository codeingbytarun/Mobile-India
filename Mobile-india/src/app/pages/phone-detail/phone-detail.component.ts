import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { PhoneListing } from '../../models/phone.model';
import { Shop } from '../../models/shop.model';

@Component({
  selector: 'app-phone-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './phone-detail.component.html',
  styleUrl: './phone-detail.component.css'
})
export class PhoneDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  marketplace = inject(MarketplaceService);

  phone: PhoneListing | undefined;
  shop: Shop | undefined;
  selectedImageIndex = 0;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.phone = this.marketplace.getPhoneById(id);
        if (this.phone) {
          this.shop = this.marketplace.getShopById(this.phone.shopId);
        }
      }
    });
  }

  get discountPercent(): number {
    if (!this.phone || !this.phone.mrp || this.phone.mrp <= this.phone.price) return 0;
    return Math.round(((this.phone.mrp - this.phone.price) / this.phone.mrp) * 100);
  }

  get inCart(): boolean {
    return this.phone ? this.marketplace.isInCart(this.phone.id) : false;
  }

  toggleCart(): void {
    if (!this.phone) return;
    this.marketplace.toggleCart(this.phone.id);
  }

  openWhatsApp(): void {
    if (!this.phone) return;
    this.marketplace.requestInquiry(this.phone, 'whatsapp');
  }

  callShop(): void {
    if (!this.phone) return;
    this.marketplace.requestInquiry(this.phone, 'call');
  }

  getDirections(): void {
    if (!this.shop) return;
    if (this.shop.googleMapsUrl) {
      window.open(this.shop.googleMapsUrl, '_blank');
    } else {
      const query = encodeURIComponent(`${this.shop.name}, ${this.shop.address}, ${this.shop.city}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  }
}
