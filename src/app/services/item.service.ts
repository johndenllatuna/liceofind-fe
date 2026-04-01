import { Injectable } from '@angular/core';
import { Item } from '../models/item'; // Import the blueprint from your models folder!

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private mockItems: Item[] = [
    {
      id: '1',
      name: 'Black Airpods',
      description: 'Black Airpods with sticker at back',
      location: 'Nac Building, Room 302',
      date: '01/01/26',
      imageUrl: 'assets/airpods.jpg'
    },
    // ... your other mock items ...
  ];

  getItems(): Item[] {
    return this.mockItems;
  }

  addItem(newItem: Item) {
    this.mockItems.push(newItem);
  }
}