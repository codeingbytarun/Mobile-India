import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { Shop } from '../../models/shop.model';
import { PhoneListing } from '../../models/phone.model';
import { PhoneCardComponent } from '../../components/phone-card/phone-card.component';

@Component({
  selector: 'app-shop-view',
  standalone: true,
  imports: [CommonModule, RouterModule, PhoneCardComponent],
  templateUrl: './shop-view.component.html',
  styleUrl: './shop-view.component.css'
})
export class ShopViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  marketplace = inject(MarketplaceService);

  shop: Shop | undefined;
  shopPhones: PhoneListing[] = [];
  selectedBrandFilter: string | null = null;
  copied = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || 'shop_01';
      this.shop = this.marketplace.getShopById(id);
      if (this.shop) {
        this.shopPhones = this.marketplace.getPhonesByShop(this.shop.id);
      }
    });
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
