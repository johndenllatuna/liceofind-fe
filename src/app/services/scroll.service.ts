import { Injectable, inject } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private router = inject(Router);
  private scrollPositions = new Map<string, number>();

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.router.url === '/user/home') {
          // Track window-level scroll position
          this.scrollPositions.set('/user/home', window.scrollY);
        }
      }
    });
  }

  getScrollPosition(url: string): number {
    return this.scrollPositions.get(url) || 0;
  }
}
