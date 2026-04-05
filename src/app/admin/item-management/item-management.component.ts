import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 1. ADD THIS
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
export class ItemManagement implements OnInit, OnDestroy {
  // Inject the service
  private itemService = inject(ItemService);
  
  // This array will hold the data for the HTML to loop through
  items: Item[] = [];
  private subscription: Subscription = new Subscription();

  ngOnInit() {
    // Subscribe to the items observable
    this.subscription = this.itemService.getItems().subscribe(items => {
      this.items = items;
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.subscription.unsubscribe();
  }

}