import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Item } from '../models/item.model';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private http = inject(HttpClient);
  private socketService = inject(SocketService);
  private API_URL = 'http://localhost:3000/api/items';
  
  private itemsSubject = new BehaviorSubject<Item[]>([]);

  constructor() {
    this.refreshItems();
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socketService.onEvent('new_item').subscribe(() => {
      this.refreshItems();
    });

    this.socketService.onEvent('item_updated').subscribe(() => {
      this.refreshItems();
    });
  }

  // Refresh the local subject from the backend
  refreshItems() {
    this.http.get<Item[]>(this.API_URL).subscribe(items => {
      // Only update if we received a valid array. 
      // We don't emit an empty array if the previous state was populated,
      // unless the backend explicitly returns an empty list.
      if (items) {
        this.itemsSubject.next(items);
      }
    });
  }

  getItems(): Observable<Item[]> {
    return this.itemsSubject.asObservable();
  }

  /**
   * Returns the current cached items synchronously.
   * This is crucial for fixing scroll restoration race conditions.
   */
  getCachedItems(): Item[] {
    return this.itemsSubject.value;
  }

  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.API_URL}/${id}`);
  }

  addItem(newItem: Item): Observable<any> {
    return this.http.post(this.API_URL, newItem).pipe(
      tap(() => this.refreshItems())
    );
  }

  updateItem(updatedItem: Item): Observable<any> {
    return this.http.put(`${this.API_URL}/${updatedItem.id}`, updatedItem).pipe(
      tap(() => this.refreshItems())
    );
  }

  deleteItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${itemId}`).pipe(
      tap(() => this.refreshItems())
    );
  }
}