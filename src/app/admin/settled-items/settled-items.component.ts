import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

import { ClaimService, Claim } from '../../services/claim.service';
import { Subscription } from 'rxjs';
import { Image } from '../../services/image.service';

@Component({
  selector: 'app-settled-items',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './settled-items.component.html',
  styleUrls: ['./settled-items.component.scss']
})
export class SettledItems implements OnInit, OnDestroy, AfterViewInit {
  private claimService = inject(ClaimService);
  private imageService = inject(Image);
  private cdr = inject(ChangeDetectorRef);
  private claimSub: Subscription | null = null;
  
  pageEntered: boolean = false;
  settledClaims: Claim[] = [];
  filteredClaims: Claim[] = [];
  searchTerm: string = '';
  activeTab: string = 'all';
  selectedItem: Claim | null = null;
  isEditMode: boolean = false;
  tempProofDetails: string = '';
  selectedFile: File | null = null;
  tempImageUrl: string | ArrayBuffer | null = null; 
  isDragging: boolean = false; 
  isSaving: boolean = false;

  get hasChanges(): boolean {
    if (!this.selectedItem) return false;
    const proofChanged = this.tempProofDetails !== this.selectedItem.proofText;
    const imageChanged = !!this.selectedFile;
    return proofChanged || imageChanged;
  }

  ngOnInit() {
    this.claimSub = this.claimService.getClaims().subscribe((claims: Claim[]) => {
      this.settledClaims = claims.filter((claim: Claim) => claim.status === 'verified' || claim.status === 'rejected');
      this.filterItems(); 
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.pageEntered = true;
      this.cdr.detectChanges(); 
    }, 50);
  }

  ngOnDestroy() {
    if (this.claimSub) {
      this.claimSub.unsubscribe();
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.filterItems();
  }

  filterItems() {
    let baseClaims = this.settledClaims;
    if (this.activeTab !== 'all') {
      baseClaims = this.settledClaims.filter(claim => claim.status === this.activeTab);
    }

    if (!this.searchTerm.trim()) {
      this.filteredClaims = [...baseClaims];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredClaims = baseClaims.filter(claim => 
      claim.itemName.toLowerCase().includes(term) || 
      claim.claimantName.toLowerCase().includes(term) ||
      claim.id.toString().toLowerCase().includes(term)
    );
  }

  viewDetails(claim: Claim) {
    this.selectedItem = claim;
    this.tempProofDetails = claim.proofText; 
    
    // Use evidenceImageUrl for the proof preview
    if (claim.evidenceImageUrl && claim.evidenceImageUrl.endsWith('.pdf')) {
       this.tempImageUrl = null;
    } else {
       this.tempImageUrl = claim.evidenceImageUrl || null; 
    }
    
    this.selectedFile = null;
  }

  goBack() {
    this.selectedItem = null;
    this.selectedFile = null;
    this.tempImageUrl = null;
  }

  // Remove cancelEdit as goBack handles it now
  // Remove enterEditMode as viewDetails handles it now

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      input.value = ''; // Safely clear for future selections
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
    reader.onload = (e) => {
      this.tempImageUrl = e.target?.result as string;
      this.cdr.detectChanges(); 
    };
    reader.readAsDataURL(file);
  }

  saveChanges() {
    if (this.selectedItem && !this.isSaving) {
      this.isSaving = true;
      console.log('Saving changes for claim:', this.selectedItem.id);
      
      const claimToUpdate = { ...this.selectedItem, proofText: this.tempProofDetails };
      
      const onComplete = () => {
        this.isSaving = false;
        this.goBack();
        this.cdr.detectChanges();
      };

      if (this.selectedFile) {
        // Upload new proof image first, then save
        this.imageService.uploadProof(this.selectedFile).subscribe({
          next: (uploadedUrl) => {
            console.log('Proof image uploaded:', uploadedUrl);
            claimToUpdate.evidenceImageUrl = uploadedUrl;
            this.claimService.updateClaim(claimToUpdate).subscribe({
              next: () => {
                console.log('Claim updated successfully with image');
                onComplete();
              },
              error: (err) => {
                console.error('Failed to save claim changes:', err);
                this.isSaving = false;
                this.cdr.detectChanges();
              }
            });
          },
          error: (err) => {
            console.error('Failed to upload proof image:', err);
            this.isSaving = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.claimService.updateClaim(claimToUpdate).subscribe({
          next: () => {
            console.log('Claim updated successfully without image');
            onComplete();
          },
          error: (err) => {
            console.error('Failed to save claim changes:', err);
            this.isSaving = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }
}