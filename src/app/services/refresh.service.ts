import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  private homeRefreshSubject = new Subject<void>();

  /** Observable that components can subscribe to for Home refresh events */
  homeRefreshRequested$ = this.homeRefreshSubject.asObservable();

  /** Emits a refresh event for the Home page */
  requestHomeRefresh() {
    this.homeRefreshSubject.next();
  }
}
