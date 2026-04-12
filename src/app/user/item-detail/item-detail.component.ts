import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClaimService, Claim } from '../../services/claim.service';
import { ItemService } from '../../services/item.service';
import { AuthService } from '../../services/auth.service'; // Added Missing Import
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
  private authService = inject(AuthService); // New Injection
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  showClaimModal = false;
  showSuccessModal = false;
  proofText = '';
  
  isDragging = false;
  imagePreview: string | undefined = undefined;
  selectedFile: File | undefined = undefined;

  item: Item | undefined = undefined;
  userHasPendingClaim = false;
  isItemUnderReview = false;
  userHasRejectedClaim = false;

  private sub: Subscription | null = null;
  private claimSub: Subscription | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.sub = this.itemService.getItemById(id).subscribe(data => {
          this.item = data;
          
          // Watch claims for state updates
          this.claimSub = this.claimService.getClaims().subscribe(claims => {
            if (!this.item) return;
            const currentUser = this.authService.getCurrentUser();
            
            // Filter claims for exactly this item that are still pending
            const itemClaims = claims.filter(c => 
              (c.itemId === this.item?.id || c.itemName === this.item?.name) && c.status === 'pending'
            );
            
            this.isItemUnderReview = itemClaims.length > 0;
            this.userHasPendingClaim = itemClaims.some(c => c.claimantEmail === currentUser.email);

            // Anti-spam: check if this user had a claim rejected for this specific item
            this.userHasRejectedClaim = claims.some(c =>
              (c.itemId === this.item?.id || c.itemName === this.item?.name) &&
              c.status === 'rejected' &&
              c.claimantEmail === currentUser.email
            );
          });
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.claimSub) {
      this.claimSub.unsubscribe();
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
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

    const user = this.authService.getCurrentUser(); // Fetch mock user

    const newClaim: Claim = {
      id: 'C-' + Math.floor(1000 + Math.random() * 9000).toString(),
      itemId: this.item.id,
      itemName: this.item.name,
      itemImageUrl: this.item.imageUrl || '',
      claimantName: user.name, // Real name from Auth
      claimantEmail: user.email, // Real email from Auth
      claimDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      proofText: this.proofText,
      // Persist the Base64 image and original filename if the user uploaded evidence
      evidenceImageUrl: this.imagePreview || undefined,
      evidenceFileName: this.selectedFile?.name || undefined
    };

    this.claimService.submitClaim(newClaim);
    
    this.showClaimModal = false;
    this.proofText = '';
    this.imagePreview = undefined;
    this.selectedFile = undefined;
    
    // Switch to Success Modal instead of Alert
    this.showSuccessModal = true;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    // Removed this.router.navigate(['/user/profile']); so user stays on the page
  }
}
