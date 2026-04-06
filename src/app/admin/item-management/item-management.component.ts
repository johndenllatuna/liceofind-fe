import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Item } from '../../models/item.model'; 
import { ItemService } from '../../services/item.service'; 
import { Sidebar } from '../../shared/sidebar/sidebar.component'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [CommonModule, Sidebar], 
  templateUrl: './item-management.component.html',
  styleUrls: ['./item-management.component.scss']
})
export class ItemManagement implements OnInit {
  // 1. Keep track of our lists
  allItems: Item[] = [];
  filteredItems: Item[] = []; 

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    // 2. Fetch the data when the page loads
    this.itemService.getItems().subscribe(items => {
      this.allItems = items;
      this.filteredItems = items; // Initially, show everything
    });
  }

  // 3. The magic filter method!
  onSearch(event: Event): void {
    // Grab the text the user typed and make it lowercase
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    // Filter the main list and update what we display
    this.filteredItems = this.allItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm)
    );
  }
}