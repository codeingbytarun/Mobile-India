import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../services/marketplace.service';
import { CartService } from '../../services/cart.service';
import { MetaService } from '../../services/meta.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  marketplace = inject(MarketplaceService);
  cartService = inject(CartService);
  authService = inject(AuthService);
  private metaService = inject(MetaService);
  private router = inject(Router);

  searchQuery = '';

  ngOnInit(): void {
    this.metaService.getCities().subscribe();
  }

  get availableCities(): string[] {
    const metaCities = this.metaService.cities();
    if (metaCities.length > 0) {
      return metaCities.map(c => c.name);
    }
    return this.marketplace.availableCities;
  }

  onSearch(event?: Event): void {
    if (event) event.preventDefault();
    this.marketplace.setSearch(this.searchQuery);
    if (this.router.url !== '/') {
      this.router.navigate(['/']);
    }
  }

  onCityChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.marketplace.setCity(select.value);
  }

  openAuthModal(): void {
    this.marketplace.isAuthModalOpen.set(true);
  }

  logout(): void {
    this.authService.logout();
    this.marketplace.currentUser.set(null);
    this.marketplace.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }
}
