import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PhoneListing } from '../../models/phone.model';
import { MarketplaceService } from '../../services/marketplace.service';

@Component({
  selector: 'app-phone-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './phone-card.component.html',
  styleUrl: './phone-card.component.css'
})
export class PhoneCardComponent {
  @Input({ required: true }) phone!: PhoneListing;

  marketplace = inject(MarketplaceService);

  get discountPercent(): number {
    if (!this.phone.mrp || this.phone.mrp <= this.phone.price) return 0;
    return Math.round(((this.phone.mrp - this.phone.price) / this.phone.mrp) * 100);
  }

  get inCart(): boolean {
    return this.marketplace.isInCart(this.phone.id);
  }

  toggleCart(event: Event): void {
    event.stopPropagation();
    this.marketplace.toggleCart(this.phone.id);
  }

  openWhatsApp(event: Event): void {
    event.stopPropagation();
    this.marketplace.requestInquiry(this.phone, 'whatsapp');
  }
}
