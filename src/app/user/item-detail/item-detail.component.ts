import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClaimService, Claim } from '../../services/claim.service';
import { ItemService } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/item.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetail implements OnInit, OnDestroy {
  private claimService = inject(ClaimService);
  private itemService = inject(ItemService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  showClaimModal = false;
  showSuccessModal = false;
  proofText = '';
  
  isDragging = false;
  imagePreview: string | undefined = undefined;
  selectedFile: File | undefined = undefined;

  // Reverted back to simple properties as requested
  item: Item | undefined = undefined;
  isLoading = true;
  errorMessage: string | null = null;

  userHasPendingClaim = false;
  isItemUnderReview = false;
  userHasRejectedClaim = false;

  private sub: Subscription | null = null;
  private claimSub: Subscription | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      
      console.log('ItemDetail: Fetching ID =', id);

      if (id) {
        this.isLoading = true;
        this.errorMessage = null;

        this.sub = this.itemService.getItemById(id).subscribe({
          next: (data) => {
            console.log('ItemDetail: Received data =', data);
            
            if (!data) {
              this.errorMessage = 'Item not found in database.';
              this.isLoading = false;
              return;
            }

            // Simple property mapping
            this.item = {
              ...data,
              imageUrl: data.imageUrl || (data as any).image_url 
            };
            
            this.isLoading = false;

            // Watch claims
            this.claimSub = this.claimService.getClaims().subscribe(claims => {
              if (!this.item) return;
              const currentUser = this.authService.getCurrentUser();
              
              if (currentUser && currentUser.email) {
                const itemClaims = claims.filter(c => (c.itemId === this.item?.id) && c.status === 'pending');
                this.isItemUnderReview = itemClaims.length > 0;
                this.userHasPendingClaim = itemClaims.some(c => c.claimantEmail === currentUser.email);
                this.userHasRejectedClaim = claims.some(c =>
                  (c.itemId === this.item?.id) &&
                  c.status === 'rejected' &&
                  c.claimantEmail === currentUser.email
                );
              }
            });
          },
          error: (err) => {
            console.error('ItemDetail: API Error =', err);
            this.errorMessage = 'Failed to load item. Please ensure the backend is running.';
            this.isLoading = false;
          }
        });
      } else {
        this.errorMessage = 'Invalid Item ID.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.claimSub) this.claimSub.unsubscribe();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.processFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.processFile(file);
    }
  }

  private processFile(file: File) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  submitClaim() {
    if (!this.item || !this.proofText.trim()) return;

    const user = this.authService.getCurrentUser();
    if (!user) {
      alert('Please log in to submit an inquiry.');
      return;
    }

    const newClaim: any = {
      itemId: this.item.id,
      itemName: this.item.name,
      itemImageUrl: this.item.imageUrl || '',
      claimantName: user.name,
      claimantEmail: user.email,
      proofText: this.proofText
    };

    this.claimService.submitClaim(newClaim).subscribe({
      next: () => {
        this.showClaimModal = false;
        this.proofText = '';
        this.imagePreview = undefined;
        this.selectedFile = undefined;
        this.showSuccessModal = true;
      },
      error: (err) => {
        console.error('Failed to submit claim:', err);
        alert('Failed to submit inquiry. Please try again.');
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}
