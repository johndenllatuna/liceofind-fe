import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // 👈 1. Added form imports
import { Item } from '../../models/item.model'; 
import { ItemService } from '../../services/item.service'; 
import { Sidebar } from '../../shared/sidebar/sidebar.component'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [CommonModule, Sidebar, ReactiveFormsModule], // 👈 2. Added ReactiveFormsModule here
  templateUrl: './item-management.component.html',
  styleUrls: ['./item-management.component.scss']
})
export class ItemManagement implements OnInit {
  // Keep track of our lists
  allItems: Item[] = [];
  filteredItems: Item[] = []; 

  // --- NEW MODAL STATE VARIABLES ---
  selectedItem: Item | null = null; 
  modalMode: 'view' | 'edit' | 'delete' = 'view'; 
  editForm: FormGroup;

  // 👈 3. Injected FormBuilder into your constructor
  constructor(private itemService: ItemService, private fb: FormBuilder) {
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
    this.selectedItem = item;
    this.modalMode = 'view';
    
    // Pre-fill the edit form just in case they click 'Edit'
    this.editForm.patchValue({
      name: item.name,
      description: item.description,
      location: item.location,
      date: item.date
    });
  }

  // Closes the modal completely
  closeModal() {
    this.selectedItem = null;
  }

  // Switches the modal between view, edit, and delete screens
  changeMode(mode: 'view' | 'edit' | 'delete') {
    this.modalMode = mode;
  }

  // Save Edit Logic
  saveChanges() {
    if (this.editForm.valid && this.selectedItem) {
      // Update the local item so the UI reflects changes immediately
      Object.assign(this.selectedItem, this.editForm.value);
      
      // Send the user back to the view screen
      this.changeMode('view');
    }
  }

  // Confirm Delete Logic
  confirmDelete() {
    if (this.selectedItem) {
      // Remove it from the main list
      this.allItems = this.allItems.filter(i => i.id !== this.selectedItem!.id);
      
      // Remove it from the currently displayed list
      this.filteredItems = this.filteredItems.filter(i => i.id !== this.selectedItem!.id);
      
      // Close the modal after deleting
      this.closeModal();
    }
  }
  
}