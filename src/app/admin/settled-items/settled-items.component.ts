import { Component, OnInit, inject } from '@angular/core';
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
  
  // 👇 NEW: The Master List (never modified by search)
  settledClaims: Claim[] = [];
  
  // 👇 NEW: The Display List (changes based on what user types)
  filteredClaims: Claim[] = [];
  
  // 👇 NEW: Holds what the user types in the search bar
  searchTerm: string = '';

  selectedItem: Claim | null = null;
  
  isEditMode: boolean = false;
  tempProofDetails: string = '';
  
  selectedFile: File | null = null;
  tempImageUrl: string | ArrayBuffer | null = null; 

  ngOnInit() {
    // 1. Get the master list
    this.settledClaims = this.claimService.getClaims().filter(claim => claim.status === 'verified');
    
    // 2. On initial load, the display list is identical to the master list
    this.filteredClaims = [...this.settledClaims];
  }

  // 👇 NEW: Function that runs every time the user types a letter
  filterItems() {
    // If the search bar is empty, show everything
    if (!this.searchTerm.trim()) {
      this.filteredClaims = [...this.settledClaims];
      return;
    }

    // Convert the search term to lowercase for easier matching
    const term = this.searchTerm.toLowerCase();

    // Filter the master list, and save the results into the display list
    this.filteredClaims = this.settledClaims.filter(claim => 
      claim.itemName.toLowerCase().includes(term) || 
      claim.claimantName.toLowerCase().includes(term) ||
      claim.id.toString().toLowerCase().includes(term) // Converts ID to string just in case it's a number
    );
  }

  viewDetails(claim: Claim) {
    this.selectedItem = claim;
    this.tempProofDetails = claim.proofText; 
    
    this.tempImageUrl = claim.itemImageUrl; 
    this.selectedFile = null;

    this.isEditMode = false; 
  }

  goBack() {
    this.selectedItem = null;
    this.isEditMode = false;
  }

  enterEditMode() {
    this.isEditMode = true;
  }

  cancelEdit() {
    this.isEditMode = false;
    if (this.selectedItem) {
      this.tempImageUrl = this.selectedItem.itemImageUrl;
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
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveChanges() {
    if (this.selectedItem) {
        console.log("Saving changes for claim:", this.selectedItem.id);
        
        this.selectedItem.proofText = this.tempProofDetails;
        
        if (this.tempImageUrl && this.selectedFile) {
          this.selectedItem.itemImageUrl = this.tempImageUrl as string;
          console.log("New image uploaded:", this.selectedFile.name);
        }
        
        this.isEditMode = false;
    }
  }
}