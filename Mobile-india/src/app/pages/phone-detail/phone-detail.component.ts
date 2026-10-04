import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { ShopService } from '../../services/shop.service';
import { LeadService } from '../../services/lead.service';
import { AuthService } from '../../services/auth.service';
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
  authService = inject(AuthService);
  private shopService = inject(ShopService);
  private leadService = inject(LeadService);

  phone: PhoneListing | undefined;
  shop: Shop | undefined;
  selectedImageIndex = 0;
  isLoading = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isLoading = true;
        this.marketplace.getPhoneById(id).subscribe(res => {
          this.isLoading = false;
          if (res.success && res.data) {
            this.phone = res.data;
            if (this.phone.shop) {
              this.shop = this.phone.shop as any;
            } else if (this.phone.shopId) {
              this.loadShopDetails(this.phone.shopId);
            }
          }
        });
      }
    });
  }

  private loadShopDetails(shopId: string): void {
    this.shopService.getShopByIdOrSlug(shopId).subscribe(res => {
      if (res.success && res.data?.shop) {
        this.shop = res.data.shop;
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
