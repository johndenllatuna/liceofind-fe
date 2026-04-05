import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Item } from '../models/item.model'; // Make sure this file exists in your models folder!

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  // 1. Your initial dummy data
  private mockItems: Item[] = [
    {
      id: '1',
      name: 'Black Airpods',
      description: 'Black Airpods with sticker at back',
      location: 'Nac Building, Room 302',
      date: '01/01/26',
      imageUrl: 'assets/airpods.jpg'
    }
    // You can add more mock items here if you want
  ];

  // 2. The BehaviorSubject that holds the current state of your items
  private itemsSubject = new BehaviorSubject<Item[]>(this.mockItems);

  // 3. The Observable that other components will "listen" to (Notice the $)
  items$ = this.itemsSubject.asObservable();

  constructor() {}

  // Optional: A method just in case you need to fetch as a function instead of a variable
  getItems(): Observable<Item[]> {
    return this.itemsSubject.asObservable();
  }

  // 4. The method triggered by your Post Item page
  addItem(newItem: Item) {
    this.mockItems.push(newItem);
    // Emit a completely new array reference so Angular detects the change instantly
    this.itemsSubject.next([...this.mockItems]); 
  }
}