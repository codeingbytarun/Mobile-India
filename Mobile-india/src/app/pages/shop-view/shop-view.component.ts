import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../services/marketplace.service';
import { ShopService } from '../../services/shop.service';
import { Shop, ShopReview, ShopQrResponse } from '../../models/shop.model';
import { PhoneListing } from '../../models/phone.model';
import { PhoneCardComponent } from '../../components/phone-card/phone-card.component';

@Component({
  selector: 'app-shop-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PhoneCardComponent],
  templateUrl: './shop-view.component.html',
  styleUrl: './shop-view.component.css'
})
export class ShopViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  marketplace = inject(MarketplaceService);
  private shopService = inject(ShopService);

  shop: Shop | undefined;
  shopPhones: PhoneListing[] = [];
  selectedBrandFilter: string | null = null;
  copied = false;
  isLoading = false;

  // Reviews
  reviews = signal<ShopReview[]>([]);
  showReviewModal = false;
  reviewRating = 5;
  reviewComment = '';
  isSubmittingReview = false;

  // QR Code
  qrData = signal<ShopQrResponse | null>(null);
  showQrModal = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idOrSlug = params.get('id') || 'shop_01';
      this.loadShop(idOrSlug);
    });
  }

  loadShop(idOrSlug: string): void {
    this.isLoading = true;
    this.shopService.getShopByIdOrSlug(idOrSlug).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.shop = res.data.shop;
          this.shopPhones = res.data.inventory || [];
          if (this.shop?.id) {
            this.loadReviews(this.shop.id);
          }
        } else {
          this.fallbackLoad(idOrSlug);
        }
      },
      error: () => {
        this.isLoading = false;
        this.fallbackLoad(idOrSlug);
      }
    });
  }

  private fallbackLoad(idOrSlug: string): void {
    this.shop = this.marketplace.getShopById(idOrSlug) || this.marketplace.activeMerchantShop();
    if (this.shop) {
      this.shopPhones = this.marketplace.getPhonesByShop(this.shop.id);
    }
  }

  loadReviews(shopId: string): void {
    this.shopService.getShopReviews(shopId).subscribe(res => {
      if (res.success && Array.isArray(res.data)) {
        this.reviews.set(res.data);
      }
    });
  }

  submitReview(): void {
    if (!this.shop || !this.reviewComment.trim()) return;

    this.isSubmittingReview = true;
    this.shopService.addShopReview(this.shop.id, this.reviewRating, this.reviewComment.trim()).subscribe({
      next: (res) => {
        this.isSubmittingReview = false;
        this.showReviewModal = false;
        this.reviewComment = '';
        if (this.shop) {
          this.loadReviews(this.shop.id);
        }
      },
      error: () => {
        this.isSubmittingReview = false;
        this.showReviewModal = false;
      }
    });
  }

  openQrModal(): void {
    if (!this.shop) return;
    this.showQrModal = true;
    if (!this.qrData()) {
      this.shopService.getShopQrCode(this.shop.id).subscribe(res => {
        if (res.success && res.data) {
          this.qrData.set(res.data);
        }
      });
    }
  }

  get displayedPhones(): PhoneListing[] {
    if (!this.selectedBrandFilter) return this.shopPhones;
    return this.shopPhones.filter(p => p.brand === this.selectedBrandFilter);
  }

  get availableBrands(): string[] {
    const set = new Set<string>();
    this.shopPhones.forEach(p => set.add(p.brand));
    return Array.from(set);
  }

  whatsappOwner(): void {
    if (!this.shop) return;
    const text = `Namaste ${this.shop.name}! I am browsing your digital store on MobiMarket. Are you open today?`;
    window.open(`https://wa.me/${this.shop.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  }

  callShop(): void {
    if (!this.shop) return;
    window.location.href = `tel:${this.shop.phone}`;
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

  shareShop(): void {
    navigator.clipboard?.writeText(window.location.href);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2500);
  }
}
