import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Sidebar } from '../../shared/sidebar/sidebar.component';
import { ClaimService, Claim } from '../../services/claim.service';
import { Subscription } from 'rxjs';
import { Image } from '../../services/image.service';

@Component({
  selector: 'app-settled-items',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar], 
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
  selectedItem: Claim | null = null;
  isEditMode: boolean = false;
  tempProofDetails: string = '';
  selectedFile: File | null = null;
  tempImageUrl: string | ArrayBuffer | null = null; 
  isDragging: boolean = false; // New state for Drag & Drop feedback
  ngOnInit() {
    this.claimSub = this.claimService.getClaims().subscribe((claims: Claim[]) => {
      this.settledClaims = claims.filter((claim: Claim) => claim.status === 'verified');
      this.filterItems(); // Ensure search filters persist if data hot-reloads
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