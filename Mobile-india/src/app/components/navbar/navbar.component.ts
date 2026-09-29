import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../services/marketplace.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  marketplace = inject(MarketplaceService);
  private router = inject(Router);

  searchQuery = '';

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
    this.marketplace.logout();
    this.router.navigate(['/']);
  }
}
