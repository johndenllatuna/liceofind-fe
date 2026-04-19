import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers: { [key: string]: DetachedRouteHandle } = {};

  // Determine if this route should be cached when leaving it
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Only cache the User Home page to perfectly preserve feed scroll state
    return route.routeConfig?.path === 'user/home';
  }

  // Store the detached route handle
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    if (route.routeConfig?.path) {
      this.handlers[route.routeConfig.path] = handle;
    }
  }

  // Determine if we should restore a cached route when entering it
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig?.path && !!this.handlers[route.routeConfig.path];
  }

  // Retrieve the cached route handle
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig?.path) return null;
    return this.handlers[route.routeConfig.path] || null;
  }

  // Determine if the route should be reused (standard Angular behavior)
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  // Optional: clear cache on logout
  clearCache() {
    this.handlers = {};
  }
}
