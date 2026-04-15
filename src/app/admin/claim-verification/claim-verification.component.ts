import { Component, OnInit, OnDestroy, inject, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar.component'; 
import { ClaimService, Claim } from '../../services/claim.service'; 
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-claim-verification',
  standalone: true,
  imports: [Sidebar, CommonModule],
  templateUrl: './claim-verification.component.html',
  styleUrls: ['./claim-verification.component.scss']
})
export class ClaimVerification implements OnInit, OnDestroy, AfterViewInit {
  private claimService = inject(ClaimService);
  private itemService = inject(ItemService);
  private cdr = inject(ChangeDetectorRef);
  
  allClaims: Claim[] = [];
  filteredClaims: Claim[] = [];

  // --- ANIMATION STATE ---
  pageEntered: boolean = false;

  // Modal State
  selectedClaim: Claim | null = null;
  isViewingImage: boolean = false; // NEW: Toggle between details and image view

  private claimSub: any;

  ngOnInit() {
    this.claimSub = this.claimService.getClaims().subscribe((claims: Claim[]) => {
      this.allClaims = claims.filter(c => c.status === 'pending');
      this.filteredClaims = [...this.allClaims];
    });
  }

  ngAfterViewInit() {
    // Trigger entrance animation cleanly
    setTimeout(() => {
      this.pageEntered = true;
      this.cdr.detectChanges(); // Force Angular to evaluate [class.is-entered] immediately
    }, 50);
  }

  ngOnDestroy() {
    if (this.claimSub) {
      this.claimSub.unsubscribe();
    }
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (!query) {
      this.filteredClaims = [...this.allClaims];
    } else {
      this.filteredClaims = this.allClaims.filter(claim => 
        String(claim.id || '').toLowerCase().includes(query) ||
        String(claim.itemName || '').toLowerCase().includes(query) ||
        String(claim.claimantName || '').toLowerCase().includes(query) ||
        String(claim.claimantEmail || '').toLowerCase().includes(query)
      );
    }
  }

  // --- Modal Functions ---

  openReviewModal(claim: Claim) {
    this.selectedClaim = claim;
    this.isViewingImage = false; // Reset to details view
  }

  closeModal() {
    this.selectedClaim = null;
    this.isViewingImage = false; // Reset state
  }

  toggleImageView(view: boolean) {
    this.isViewingImage = view;
  }

  approveClaim() {
    if (this.selectedClaim) {
      // 1. Update the claim status
      this.claimService.updateClaimStatus(this.selectedClaim.id, 'verified').subscribe({
        next: () => {
          // 2. Mark the associated item as Settled
          if (this.selectedClaim?.itemId) {
            this.itemService.getItemById(this.selectedClaim.itemId).subscribe(item => {
              if (item) {
                this.itemService.updateItem({ ...item, status: 'Settled' }).subscribe();
              }
            });
          }
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to approve claim:', err)
      });
    }
  }

  rejectClaim() {
    if (this.selectedClaim) {
      this.claimService.updateClaimStatus(this.selectedClaim.id, 'rejected').subscribe({
        next: () => {
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to reject claim:', err)
      });
    }
  }
}