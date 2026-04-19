import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClaimService } from '../../services/claim.service';
import { AuthService } from '../../services/auth.service';

export interface Claim {
  id: number | string;
  itemName: string;
  dateClaimed: string;
  status: 'Pending' | 'Verified' | 'Rejected' | 'pending' | 'verified' | 'rejected';
  proofText?: string;
  imageUrl?: string;
  description?: string;
  location?: string;
  itemImageUrl?: string;
}

@Component({
  selector: 'app-my-claims',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-claims.html',
  styleUrls: ['./my-claims.scss']
})
export class MyClaims implements OnInit, OnDestroy {
  private claimService = inject(ClaimService);
  private authService = inject(AuthService);
  private claimSub: Subscription | null = null;

  myClaims: Claim[] = [];
  currentUser = this.authService.getCurrentUser();

  // Modal state
  isModalOpen = signal(false);
  selectedClaim = signal<Claim | null>(null);

  ngOnInit() {
    window.scrollTo(0, 0);
    if (this.currentUser && this.currentUser.email) {
      this.claimSub = this.claimService.getClaims().subscribe(allClaims => {
        this.myClaims = allClaims
          .filter(c => c.claimantEmail === this.currentUser!.email)
          .map(c => ({
            id: c.id,
            itemName: c.itemName,
            dateClaimed: c.claimDate,
            status: this.capitalize(c.status) as any,
            proofText: c.proofText,
            imageUrl: c.itemImageUrl,
            description: c.itemDescription,
            location: c.itemLocation
          }));
      });
    }
  }

  openClaimModal(claim: Claim) {
    this.selectedClaim.set(claim);
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeClaimModal() {
    this.isModalOpen.set(false);
    this.selectedClaim.set(null);
    document.body.style.overflow = '';
  }

  ngOnDestroy() {
    if (this.claimSub) {
      this.claimSub.unsubscribe();
    }
    document.body.style.overflow = '';
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
