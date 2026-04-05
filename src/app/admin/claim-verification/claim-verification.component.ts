import { Component, OnInit, inject } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar.component'; 
import { ClaimService, Claim } from '../../services/claim.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-claim-verification',
  standalone: true,
  imports: [Sidebar, CommonModule],
  templateUrl: './claim-verification.component.html',
  styleUrls: ['./claim-verification.component.scss']
})
export class ClaimVerification implements OnInit {
  private claimService = inject(ClaimService);
  
  allClaims: Claim[] = [];
  filteredClaims: Claim[] = [];
  activeTab: string = 'all';

  // NEW: State for the modal
  selectedClaim: Claim | null = null;

  ngOnInit() {
    this.allClaims = this.claimService.getClaims();
    this.filteredClaims = [...this.allClaims];
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'all') {
      this.filteredClaims = [...this.allClaims];
    } else {
      this.filteredClaims = this.allClaims.filter(claim => claim.status === tab);
    }
  }

  // --- NEW: Modal Functions ---

  openReviewModal(claim: Claim) {
    this.selectedClaim = claim;
  }

  closeModal() {
    this.selectedClaim = null;
  }

  approveClaim() {
    if (this.selectedClaim) {
      // In a real app, you would call a service to update the database here
      this.selectedClaim.status = 'verified'; 
      this.closeModal();
      // Re-filter the list so the UI updates immediately
      this.setTab(this.activeTab); 
    }
  }

  rejectClaim() {
    if (this.selectedClaim) {
      // In a real app, you would call a service to update the database here
      this.selectedClaim.status = 'rejected';
      this.closeModal();
      this.setTab(this.activeTab);
    }
  }
}