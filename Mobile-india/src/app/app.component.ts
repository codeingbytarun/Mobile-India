import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { MarketplaceService } from './services/marketplace.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, BottomNavComponent, AuthModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MobiMarket';
  marketplace = inject(MarketplaceService);

  onModalClose(): void {
    this.marketplace.isAuthModalOpen.set(false);
    const pending = this.marketplace.pendingInquiry();
    if (pending && this.marketplace.currentUser()) {
      this.marketplace.executeInquiry(pending.phone, pending.channel);
      this.marketplace.pendingInquiry.set(null);
    }
  }
}
