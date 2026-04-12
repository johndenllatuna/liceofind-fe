import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Item } from '../models/item.model'; // Make sure this file exists in your models folder!

@Injectable({
  providedIn: 'root' // This makes the service accessible anywhere in the app
})
export class ItemService {
  
  private STORAGE_KEY = 'ldcufind_items';
  
  // 1. Start with data from LocalStorage, or an empty dataset if nothing exists
  private itemsSubject = new BehaviorSubject<Item[]>(this.loadInitialItems());

  constructor() { }

  private loadInitialItems(): Item[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  // 3. READ: Components call this to listen for the item list
  getItems(): Observable<Item[]> {
    return this.itemsSubject.asObservable();
  }

  getItemById(id: number): Observable<Item | undefined> {
    const currentItems = this.itemsSubject.getValue();
    const item = currentItems.find(i => i.id === id);
    return new BehaviorSubject<Item | undefined>(item).asObservable();
  }

  // 4. WRITE: We will use this method later in the "Post Item" page
  addItem(newItem: Item) {
    console.log('Service receiving image with length:', newItem.imageUrl?.length);
    // Get the current list
    const currentItems = this.itemsSubject.getValue();
    
    // Auto-generate a new ID (find the highest current ID and add 1)
    newItem.id = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.id)) + 1 : 1;
    
    // Broadcast the new list (spread operator puts the new item at the top)
    const updatedItems = [newItem, ...currentItems];
    this.itemsSubject.next(updatedItems);
    
    // Save the updated list to local storage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedItems));
  }

  updateItem(updatedItem: Item) {
    const currentItems = this.itemsSubject.getValue();
    const index = currentItems.findIndex(i => i.id === updatedItem.id);
    
    if (index !== -1) {
      const updatedArray = [...currentItems];
      updatedArray[index] = { ...updatedItem };
      
      this.itemsSubject.next(updatedArray);
      
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedArray));
      }
    }
  }

  deleteItem(itemId: number) {
    const currentItems = this.itemsSubject.getValue();
    const updatedArray = currentItems.filter(i => i.id !== itemId);
    
    this.itemsSubject.next(updatedArray);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedArray));
    }
  }
}