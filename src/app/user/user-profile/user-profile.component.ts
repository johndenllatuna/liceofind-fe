import { Component, signal, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ClaimService, Claim as ServiceClaim } from '../../services/claim.service';
import { Image as ImageService } from '../../services/image.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

export interface Claim {
  id: number | string;
  itemName: string;
  dateClaimed: string;
  status: 'Pending' | 'Verified' | 'Rejected' | 'pending' | 'verified' | 'rejected';
  proofText?: string;
  imageUrl?: string;
  description?: string;
  location?: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})


export class UserProfile implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private claimService = inject(ClaimService);
  private imageService = inject(ImageService);
  private socketService = inject(SocketService);
  private cdr = inject(ChangeDetectorRef);

  private statusUpdateSub?: Subscription;

  showLogoutModal = signal(false);
  showPrivacyModal = signal(false);
  isUploadingAvatar = signal(false);

  // Claim item details modal
  isItemModalOpen = signal(false);
  selectedItem = signal<Claim | null>(null);

  openItemModal(claim: Claim) {
    this.selectedItem.set(claim);
    this.isItemModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeItemModal() {
    this.isItemModalOpen.set(false);
    this.selectedItem.set(null);
    document.body.style.overflow = '';
    this.dragCurrentY.set(0);
    this.isDragging.set(false);
  }


  isEditingName = false;
  tempName = '';

  enableEdit() {
    this.isEditingName = true;
    this.tempName = this.user.name;
  }

  cancelEdit() {
    this.isEditingName = false;
  }

  getUserInitials(): string {
    const name = this.user?.name || 'G';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  onAvatarClick() {
    const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    this.isUploadingAvatar.set(true);

    this.imageService.uploadImage(file).subscribe({
      next: (url) => {
        const userId = this.currentUser?.id;
        if (!userId) return;

        this.authService.updateProfile(userId, { avatarUrl: url }).subscribe({
          next: (response) => {
            this.isUploadingAvatar.set(false);
            this.user.avatarUrl = response.user.avatar_url;
            // Update local storage via service call if needed, but updateProfile already does it
          },
          error: (err) => {
            this.isUploadingAvatar.set(false);
            console.error('Failed to update profile avatar:', err);
            alert('Failed to update avatar. Please try again.');
          }
        });
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        console.error('Failed to upload image:', err);
        alert('Failed to upload image. Please try again.');
      }
    });
  }

  saveName() {
    if (!this.tempName.trim() || this.tempName === this.user.name) {
      this.isEditingName = false;
      return;
    }

    const userId = this.currentUser?.id;
    if (!userId) return;

    // Optimistic Update: Close UI and update display name immediately
    const previousName = this.user.name;

    this.user.name = this.tempName;
    this.isEditingName = false;

    this.authService.updateProfile(userId, { name: this.tempName }).subscribe({
      next: (response) => {
        // Successfully saved on server
        this.user.name = response.user.name;
        // If no custom avatar, refresh the initials-based avatar
        if (!response.user.avatar_url) {
          this.user.avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${response.user.name}&backgroundColor=8A0000&fontFamily=Inter,sans-serif&fontWeight=700`;
        }
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        // Rollback on error
        this.user.name = previousName;
        this.tempName = previousName;
        alert('Failed to update name. Please check your connection.');
      }
    });
  }


  // Initialize with real data from AuthService
  currentUser: any = this.authService.getCurrentUser();
  user = {
    name: this.currentUser?.name || 'Guest',
    email: this.currentUser?.email || '',
    avatarUrl: this.currentUser?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${this.currentUser?.name || 'Guest'}&backgroundColor=8A0000&fontFamily=Inter,sans-serif&fontWeight=700`,
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
    window.scrollTo(0, 0);
    this.refreshClaims();

    // Listen for real-time status updates and modify the local array directly
    this.statusUpdateSub = this.socketService.onClaimStatusUpdated().subscribe(update => {
      console.log('Received WebSocket update for claim:', update);
      const claimIndex = this.myClaims.findIndex(c => c.id == update.id); // use == to allow number/string match

      if (claimIndex !== -1) {
        console.log('Found claim locally, updating status...');
        // Update the claim status in the local array directly
        const newStatus = this.capitalize(update.status) as any;

        // Create a new reference to trigger Angular change detection
        this.myClaims = [
          ...this.myClaims.slice(0, claimIndex),
          { ...this.myClaims[claimIndex], status: newStatus },
          ...this.myClaims.slice(claimIndex + 1)
        ];

        // Also update the selected item if the modal is currently open
        if (this.selectedItem()?.id === update.id) {
          const currentItem = this.selectedItem();
          if (currentItem) {
            this.selectedItem.set({ ...currentItem, status: newStatus });
          }
        }

        // Force Angular to check for changes since socket events might run outside the Angular Zone
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.statusUpdateSub) {
      this.statusUpdateSub.unsubscribe();
    }
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
          status: this.capitalize(c.status) as any,
          proofText: c.proofText,
          imageUrl: c.itemImageUrl,
          description: c.itemDescription,
          location: c.itemLocation
        }));
    });
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.visibility = 'hidden'; // hide broken img; initials show behind
  }

  onAvatarLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.visibility = 'visible'; // show successfully loaded img
  }

  confirmLogout() {
    this.authService.logout();
    this.showLogoutModal.set(false);
    this.router.navigate(['/']);
  }

  // --- Drag to Close Modal (shared by Privacy Policy + Claim Details) ---
  dragStartY = 0;
  dragCurrentY = signal(0);
  isDragging = signal(false);

  // Bound references so we can remove the listeners later
  private _onMouseMove = (e: MouseEvent) => this._handleDragMove(e);
  private _onMouseUp   = () => this._handleDragEnd();

  onDragStart(event: TouchEvent | MouseEvent) {
    // Prevent the browser from triggering click/scroll on the same touch
    event.preventDefault();
    this.isDragging.set(true);
    this.dragStartY = this._getClientY(event);
    this.dragCurrentY.set(0);

    // Attach document-level mouse listeners so the drag tracks even
    // when the pointer moves outside the small .modal-drag-area element
    if (event.type === 'mousedown') {
      document.addEventListener('mousemove', this._onMouseMove);
      document.addEventListener('mouseup',   this._onMouseUp);
    }
  }

  onDragMove(event: TouchEvent | MouseEvent) {
    this._handleDragMove(event);
  }

  private _handleDragMove(event: TouchEvent | MouseEvent) {
    if (!this.isDragging()) return;
    const currentY = this._getClientY(event);
    const deltaY = Math.max(0, currentY - this.dragStartY);
    this.dragCurrentY.set(deltaY);
  }

  onDragEnd() {
    this._handleDragEnd();
  }

  private _handleDragEnd() {
    if (!this.isDragging()) return;
    this.isDragging.set(false);

    // Clean up document-level mouse listeners
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup',   this._onMouseUp);

    // If dragged down more than 100px, close the active modal
    if (this.dragCurrentY() > 100) {
      if (this.showPrivacyModal()) {
        this.closePrivacyModal();
      } else if (this.isItemModalOpen()) {
        this.closeItemModal();
      }
    } else {
      // Snap back to original position
      this.dragCurrentY.set(0);
    }
  }

  private _getClientY(event: TouchEvent | MouseEvent): number {
    if (event.type === 'touchstart' || event.type === 'touchmove') {
      // .touches is populated during touchstart and touchmove
      return (event as TouchEvent).touches[0].clientY;
    }
    if (event.type === 'touchend') {
      // .touches is EMPTY on touchend — must use .changedTouches instead
      return (event as TouchEvent).changedTouches[0].clientY;
    }
    return (event as MouseEvent).clientY;
  }

  closePrivacyModal() {
    this.showPrivacyModal.set(false);
    this.dragCurrentY.set(0);
    this.isDragging.set(false);
  }
}
