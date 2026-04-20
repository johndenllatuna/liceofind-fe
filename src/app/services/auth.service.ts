import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map, switchMap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Admin';
  isActive?: boolean;
  is_active?: boolean;
  password?: string;
  avatar_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private API_URL = 'http://localhost:3000/api/auth';
  private USER_API_URL = 'http://localhost:3000/api/users';

  // RxJS BehaviorSubject to hold the current user state in memory
  currentUser = new BehaviorSubject<User | null>(null);

  // Deactivation modal state — raised by AppComponent (real-time) or login (blocked)
  showDeactivationModal = signal(false);
  deactivationModalMode = signal<'logout' | 'continue'>('logout');

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('ldcufind_token');
      localStorage.removeItem('ldcufind_current_user');
    }
    this.fetchCurrentUser().subscribe();
  }

  fetchCurrentUser(): Observable<User | null> {
    return this.http.get<{user: User}>(`${this.API_URL}/me`, { withCredentials: true }).pipe(
      map(res => res.user),
      tap(user => this.currentUser.next(user)),
      catchError(() => {
        this.currentUser.next(null);
        return of(null);
      })
    );
  }

  login(email: string, password: string, role: string = 'Student'): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { email, password, role }, { withCredentials: true }).pipe(
      switchMap(() => this.fetchCurrentUser())
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  verifyOtp(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/verify-otp`, data);
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/resend-otp`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, data);
  }

  logout(isAdmin: boolean = false) {
    this.http.post(`${this.API_URL}/logout`, {}).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.currentUser.next(null);
      
      // Clear route reuse cache to prevent memory leaks or security issues between user sessions
      const routeStrategy = this.router.routeReuseStrategy as any;
      if (routeStrategy && typeof routeStrategy.clearCache === 'function') {
        routeStrategy.clearCache();
      }

      if (isAdmin) {
        this.router.navigate(['/admin-login']);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  getCurrentUser(): User | any {
    return this.currentUser.getValue() || {
      id: '',
      name: 'Guest',
      email: '',
      role: 'Student',
      isActive: false
    };
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.USER_API_URL);
  }

  toggleUserStatus(userId: string): Observable<any> {
    return this.http.patch(`${this.USER_API_URL}/${userId}/status`, {});
  }

  updateProfile(userId: string, data: any): Observable<any> {
    return this.http.patch(`${this.USER_API_URL}/${userId}`, data).pipe(
      tap((response: any) => {
        if (response.user) {
          this.currentUser.next(response.user);
        }
      })
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.USER_API_URL}/change-password`, data);
  }
}
