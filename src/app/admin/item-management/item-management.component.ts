import { Component, inject, OnInit } from '@angular/core';
import { ItemService, Item } from '../../services/item.service'; 
import { Sidebar } from '../../shared/sidebar/sidebar.component'; 

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './item-management.component.html',
  styleUrls: ['./item-management.component.scss']
})
export class ItemManagement implements OnInit {
  // Inject the service
  private itemService = inject(ItemService);
  
  // This array will hold the data for the HTML to loop through
  items: Item[] = [];

  ngOnInit() {
    // When the page loads, grab the data from the service
    this.items = this.itemService.getItems();
  }
}