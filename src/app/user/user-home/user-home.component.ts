import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHome implements OnInit, OnDestroy {
  userAvatarUrl = signal('https://api.dicebear.com/7.x/initials/svg?seed=AT&backgroundColor=8A0000&fontFamily=Inter,sans-serif&fontWeight=700');
  searchQuery = '';
  searchFocused = false;
  allItems: Item[] = [];
  filteredItems: Item[] = [];

  private itemSub: Subscription | null = null;

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.itemSub = this.itemService.getItems().subscribe(items => {
      this.allItems = items;
      this.filteredItems = items;
    });
  }

  ngOnDestroy() {
    if (this.itemSub) {
      this.itemSub.unsubscribe();
    }
  }

  onSearchInput() {
    if (!this.searchQuery.trim()) {
      this.filteredItems = [...this.allItems];
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  searchItems() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredItems = [...this.allItems];
      return;
    }

    this.filteredItems = this.allItems.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }
}
