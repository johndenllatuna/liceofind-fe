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
  activeTab: string = 'all';

  // --- ANIMATION STATE ---
  pageEntered: boolean = false;

  // Modal State
  selectedClaim: Claim | null = null;
  isViewingImage: boolean = false; // NEW: Toggle between details and image view

  private claimSub: any;

  ngOnInit() {
    this.claimSub = this.claimService.getClaims().subscribe((claims: Claim[]) => {
      this.allClaims = claims;
      this.setTab(this.activeTab); 
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

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'all') {
      this.filteredClaims = [...this.allClaims];
    } else {
      this.filteredClaims = this.allClaims.filter((claim: Claim) => claim.status === tab);
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
      // 1. Update the claim status to verified and persist to localStorage
      const updatedClaim: Claim = { ...this.selectedClaim, status: 'verified' };
      this.claimService.updateClaim(updatedClaim);

      // 2. Find the associated item and mark it as Settled
      const allItems = this.itemService['itemsSubject'].getValue();
      const item = allItems.find(i =>
        (this.selectedClaim?.itemId && i.id === this.selectedClaim.itemId) ||
        i.name === this.selectedClaim?.itemName
      );
      if (item) {
        this.itemService.updateItem({ ...item, status: 'Settled' });
      }

      this.closeModal();
      this.setTab(this.activeTab);
    }
  }

  rejectClaim() {
    if (this.selectedClaim) {
      // Update the claim status to rejected and persist to localStorage
      const updatedClaim: Claim = { ...this.selectedClaim, status: 'rejected' };
      this.claimService.updateClaim(updatedClaim);
      // Item status remains unchanged — still active for others to claim
      this.closeModal();
      this.setTab(this.activeTab);
    }
  }
}