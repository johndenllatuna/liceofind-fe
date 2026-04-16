import { Component, inject, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // 👈 1. Added form imports
import { Item } from '../../models/item.model'; 
import { ItemService } from '../../services/item.service'; 
import { Image } from '../../services/image.service'; // 👈 3. Added Image service
import { Sidebar } from '../../shared/sidebar/sidebar.component'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [CommonModule, Sidebar, ReactiveFormsModule], // 👈 2. Added ReactiveFormsModule here
  templateUrl: './item-management.component.html',
  styleUrls: ['./item-management.component.scss']
})
export class ItemManagement implements OnInit, AfterViewInit {
  // Keep track of our lists
  allItems: Item[] = [];
  filteredItems: Item[] = []; 

  // --- NEW MODAL STATE VARIABLES ---
  selectedItem: Item | null = null; 
  modalMode: 'view' | 'edit' | 'delete' = 'view'; 
  editForm: FormGroup;
  uploadedImageBase64: string | undefined = undefined;
  selectedFile: File | null = null;
  isDragging: boolean = false; 
  
  // --- TOAST FEEDBACK ---
  isToastVisible: boolean = false;
  toastMessage: string = '';
  isToastError: boolean = false;

  // --- ANIMATION STATE ---
  pageEntered: boolean = false;

  private itemService = inject(ItemService);
  private imageService = inject(Image); // 👈 5. Injected Image service
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Setup the edit form rules
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Fetch the data when the page loads
    this.itemService.getItems().subscribe(items => {
      this.allItems = items;
      this.filteredItems = items; // Initially, show everything
    });
  }

  ngAfterViewInit(): void {
    // setTimeout runs in the next macro-task, ensuring the DOM is fully painted with the 'is-entering' state first.
    setTimeout(() => {
      this.pageEntered = true;
      this.cdr.detectChanges(); // Force Angular to evaluate [class.is-entered] immediately
    }, 50);
  }

  // The magic filter method!
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredItems = this.allItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm)
    );
  }

  // --- NEW MODAL METHODS ---

  // Opens the modal and fills the form with the item's current details
  openDetails(item: Item) {
    this.uploadedImageBase64 = undefined; 
    this.selectedFile = null; // Reset for new selection
    this.selectedItem = item;
    this.modalMode = 'view';
    
    // Pre-fill the edit form with formatted date
    this.editForm.patchValue({
      name: item.name,
      description: item.description,
      location: item.location,
      date: this.formatDate(item.date)
    });
  }

  /** Converts ISO or any date string to YYYY-MM-DD for <input type="date"> */
  private formatDate(dateStr: any): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  // Closes the modal completely
  closeModal() {
    this.selectedItem = null;
    this.uploadedImageBase64 = undefined;
    this.selectedFile = null;
  }

  // Switches the modal between view, edit, and delete screens
  changeMode(mode: 'view' | 'edit' | 'delete') {
    this.modalMode = mode;
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
    this.selectedFile = file; // Store the actual file for uploading later
    const reader = new FileReader();
    reader.onload = () => {
      this.uploadedImageBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Save Edit Logic
  saveChanges() {
    if (this.editForm.valid && this.selectedItem) {
      const updatedData = { 
        ...this.selectedItem, 
        ...this.editForm.value 
      };

      console.log('Attempting item update with payload:', updatedData);

      // If a new file was selected, upload it first
      if (this.selectedFile) {
        this.imageService.uploadImage(this.selectedFile).subscribe({
          next: (url) => {
            updatedData.imageUrl = url;
            this.performUpdate(updatedData);
          },
          error: (err) => {
            console.error('Upload failed:', err);
            this.showToast('Upload failed. Check server logs.', true);
          }
        });
      } else {
        this.performUpdate(updatedData);
      }
    } else {
      this.showToast('Please fill all required fields correctly.', true);
    }
  }

  private performUpdate(updatedData: any) {
    this.itemService.updateItem(updatedData).subscribe({
      next: () => {
        this.showToast('Item updated successfully!');
        this.changeMode('view');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update item:', err);
        const errorMsg = err?.error?.error || err?.error?.message || 'Failed to update item.';
        this.showToast(errorMsg, true);
      }
    });
  }

  private showToast(message: string, isError: boolean = false) {
    this.toastMessage = message;
    this.isToastError = isError;
    this.isToastVisible = true;
    setTimeout(() => this.isToastVisible = false, 3000);
  }

  // Confirm Delete Logic
  confirmDelete() {
    if (this.selectedItem) {
      this.itemService.deleteItem(this.selectedItem.id).subscribe({
        next: () => {
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to delete item:', err)
      });
    }
  }
  
}