import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ClaimService, Claim as ServiceClaim } from '../../services/claim.service';

export interface Claim {
  id: number | string;
  itemName: string;
  dateClaimed: string;
  status: 'Pending' | 'Verified' | 'Rejected' | 'pending' | 'verified' | 'rejected';
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfile implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private claimService = inject(ClaimService);

  showLogoutModal = signal(false);
  showPrivacyModal = signal(false);

  isEditingName = false;
  tempName = '';

  enableEdit() {
    this.isEditingName = true;
    this.tempName = this.user.name;
  }

  cancelEdit() {
    this.isEditingName = false;
  }

  saveName() {
    this.user.name = this.tempName;
    this.isEditingName = false;
    // Optionally update the avatar to use the new name initials
    this.user.avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${this.tempName}&backgroundColor=8A0000&fontFamily=Inter,sans-serif&fontWeight=700`;
  }

  // Initialize with real data from AuthService
  currentUser = this.authService.getCurrentUser();
  user = {
    name: this.currentUser?.name || 'Guest',
    email: this.currentUser?.email || '',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${this.currentUser?.name || 'Guest'}&backgroundColor=8A0000&fontFamily=Inter,sans-serif&fontWeight=700`,
    memberStatus: 'Active Member',
    memberId: '88219',
  };

  onHomeClick(event: Event) {
    if (this.router.url === '/user/home') {
      window.location.reload();
    }
  }

  myClaims: Claim[] = [];

  ngOnInit() {
    this.refreshClaims();
  }

  refreshClaims() {
    // Subscribe to claims and filter by the current user's email
    this.claimService.getClaims().subscribe(allClaims => {
      this.myClaims = allClaims
        .filter(c => c.claimantEmail === this.user.email)
        .map(c => ({
          id: c.id,
          itemName: c.itemName,
          dateClaimed: c.claimDate,
          // Map lowercase service status to capitalized UI status
          status: this.capitalize(c.status) as any
        }));
    });
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  confirmLogout() {
    this.authService.logout();
    this.showLogoutModal.set(false);
    this.router.navigate(['/']);
  }
}
