import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Item } from '../models/item.model'; // Make sure this file exists in your models folder!

@Injectable({
  providedIn: 'root' // This makes the service accessible anywhere in the app
})
export class ItemService {
  
  // 1. Setup some initial mock data using a placeholder image service
  private mockData: Item[] = [
    {
      id: 1,
      name: 'Hydro Flask 32oz',
      description: 'Black water bottle, slightly dented at the bottom. Found near the bleachers.',
      location: 'Gymnasium',
      date: 'Oct 26, 2023',
      imageUrl: '/assets/icons/no-img.svg',
      status: 'Available'
    },
    {
      id: 2,
      name: 'Scientific Calculator',
      description: 'Casio fx-991EX. Has a sticker of a cat on the back cover.',
      location: 'Engineering Building',
      date: 'Oct 25, 2023',
      imageUrl: '/assets/icons/no-img.svg',
      status: 'Claim Pending'
    },
    {
      id: 3,
      name: 'Car Keys',
      description: 'Toyota key fob with a blue lanyard and a small ID tag.',
      location: 'Main Cafeteria',
      date: 'Oct 24, 2023',
      imageUrl: '/assets/icons/no-img.svg',
      status: 'Available'
    }
  ];

  // 2. The Broadcast Tower holding our data
  private itemsSubject = new BehaviorSubject<Item[]>(this.mockData);

  constructor() { }

  // 3. READ: Components call this to listen for the item list
  getItems(): Observable<Item[]> {
    return this.itemsSubject.asObservable();
  }

  // 4. WRITE: We will use this method later in the "Post Item" page
  addItem(newItem: Item) {
    // Get the current list
    const currentItems = this.itemsSubject.getValue();
    
    // Auto-generate a new ID (find the highest current ID and add 1)
    newItem.id = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.id)) + 1 : 1;
    
    // Broadcast the new list (spread operator puts the new item at the top)
    this.itemsSubject.next([newItem, ...currentItems]);
  }
}