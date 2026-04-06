import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Sidebar } from '../../shared/sidebar/sidebar.component';
import { ClaimService, Claim } from '../../services/claim.service';

@Component({
  selector: 'app-settled-items',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar], 
  templateUrl: './settled-items.component.html',
  styleUrls: ['./settled-items.component.scss']
})
export class SettledItems implements OnInit {
  private claimService = inject(ClaimService);
  private cdr = inject(ChangeDetectorRef); // <-- NEW: Forces UI to update
  
  settledClaims: Claim[] = [];
  filteredClaims: Claim[] = [];
  searchTerm: string = '';
  selectedItem: Claim | null = null;
  isEditMode: boolean = false;
  tempProofDetails: string = '';
  selectedFile: File | null = null;
  tempImageUrl: string | ArrayBuffer | null = null; 

  ngOnInit() {
    this.settledClaims = this.claimService.getClaims().filter(claim => claim.status === 'verified');
    this.filteredClaims = [...this.settledClaims];
  }

  filterItems() {
    if (!this.searchTerm.trim()) {
      this.filteredClaims = [...this.settledClaims];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredClaims = this.settledClaims.filter(claim => 
      claim.itemName.toLowerCase().includes(term) || 
      claim.claimantName.toLowerCase().includes(term) ||
      claim.id.toString().toLowerCase().includes(term)
    );
  }

  viewDetails(claim: Claim) {
    this.selectedItem = claim;
    this.tempProofDetails = claim.proofText; 
    
    // NEW: Prevent broken images by clearing the preview if the data is a PDF
    if (claim.itemImageUrl && claim.itemImageUrl.endsWith('.pdf')) {
       this.tempImageUrl = null;
    } else {
       this.tempImageUrl = claim.itemImageUrl; 
    }
    
    this.selectedFile = null;
    this.isEditMode = false; 
  }

  goBack() {
    this.selectedItem = null;
    this.isEditMode = false;
  }

  enterEditMode() {
    if (!this.selectedItem) return;

    this.isEditMode = true;
    this.tempProofDetails = this.selectedItem.proofText;
    
    // ✨ FIX 1: Preserve the existing image instead of setting it to null
    this.tempImageUrl = this.selectedItem.itemImageUrl && !this.selectedItem.itemImageUrl.endsWith('.pdf') 
      ? this.selectedItem.itemImageUrl 
      : null;
  }

  cancelEdit() {
    this.isEditMode = false;
    if (this.selectedItem) {
      this.tempImageUrl = this.selectedItem.itemImageUrl && !this.selectedItem.itemImageUrl.endsWith('.pdf') 
        ? this.selectedItem.itemImageUrl 
        : null;
    }
    this.selectedFile = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.tempImageUrl = e.target?.result as string;
        this.cdr.detectChanges(); 
        
        // ✨ FIX 2: Moved this inside the callback! 
        // Now it safely clears the input ONLY AFTER the image has been read.
        input.value = ''; 
      };
      
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveChanges() {
    if (this.selectedItem) {
        this.selectedItem.proofText = this.tempProofDetails;
        
        if (this.tempImageUrl && this.selectedFile) {
          this.selectedItem.itemImageUrl = this.tempImageUrl as string;
        }
        
        this.claimService.updateClaim(this.selectedItem);
        this.isEditMode = false;
    }
  }
}